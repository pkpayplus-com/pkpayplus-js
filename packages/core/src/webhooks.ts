import { createHmac, timingSafeEqual } from 'node:crypto';
import { PKPayPlusSecurityError } from './errors';
import type { PKPayPlusWebhookEvent } from './types';

export interface ConstructWebhookEventOptions {
  payload: string | Buffer | Record<string, unknown>;
  signatureHeader: string;
  webhookSecret: string;
  tolerance?: number;
}

export class Webhooks {
  public constructEvent<T = Record<string, unknown>>(
    options: ConstructWebhookEventOptions
  ): PKPayPlusWebhookEvent<T> {
    const { payload, signatureHeader, webhookSecret } = options;

    if (!payload) {
      throw new PKPayPlusSecurityError('Missing webhook payload');
    }
    if (!signatureHeader) {
      throw new PKPayPlusSecurityError('Missing webhook signature header (x-pkpayplus-signature)');
    }
    if (!webhookSecret) {
      throw new PKPayPlusSecurityError('Missing webhook secret');
    }

    const payloadString =
      typeof payload === 'string'
        ? payload
        : Buffer.isBuffer(payload)
          ? payload.toString('utf8')
          : JSON.stringify(payload);

    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(payloadString, 'utf8')
      .digest('hex');

    let candidateSignature = signatureHeader.trim();
    if (candidateSignature.includes('v1=')) {
      const parts = candidateSignature.split(',');
      const v1Part = parts.find((p) => p.trim().startsWith('v1='));
      if (v1Part) {
        candidateSignature = v1Part.trim().substring(3);
      }
    }

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const candidateBuffer = Buffer.from(candidateSignature, 'hex');

    if (
      expectedBuffer.length !== candidateBuffer.length ||
      !timingSafeEqual(expectedBuffer, candidateBuffer)
    ) {
      throw new PKPayPlusSecurityError('Webhook signature verification failed');
    }

    try {
      const parsed =
        typeof payload === 'string' || Buffer.isBuffer(payload)
          ? JSON.parse(payloadString)
          : payload;

      return parsed as PKPayPlusWebhookEvent<T>;
    } catch {
      throw new PKPayPlusSecurityError('Failed to parse webhook JSON payload');
    }
  }

  public generateSignature(
    payload: string | Buffer | Record<string, unknown>,
    secret: string
  ): string {
    const payloadString =
      typeof payload === 'string'
        ? payload
        : Buffer.isBuffer(payload)
          ? payload.toString('utf8')
          : JSON.stringify(payload);

    return createHmac('sha256', secret).update(payloadString, 'utf8').digest('hex');
  }
}
