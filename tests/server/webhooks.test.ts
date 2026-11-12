import { PKPayPlusSecurityError, Webhooks } from '@pkpayplus/core';
import { describe, expect, it } from 'vitest';

describe('Webhooks Resource', () => {
  const webhooks = new Webhooks();
  const secret = 'whsec_test_secret_12345';
  const samplePayload = {
    event: 'payment.succeeded',
    success: true,
    status: 'paid',
    session_id: 'sess_998877',
    amount: 50.0,
    currency: 'USD',
  };

  it('generates and verifies a valid HMAC-SHA256 signature', () => {
    const signature = webhooks.generateSignature(samplePayload, secret);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');

    const event = webhooks.constructEvent({
      payload: samplePayload,
      signatureHeader: signature,
      webhookSecret: secret,
    });

    expect(event.event).toBe('payment.succeeded');
    expect(event.session_id).toBe('sess_998877');
    expect(event.status).toBe('paid');
  });

  it('verifies signature formatted with v1= prefix', () => {
    const rawSignature = webhooks.generateSignature(samplePayload, secret);
    const headerWithPrefix = `t=1700000000,v1=${rawSignature}`;

    const event = webhooks.constructEvent({
      payload: samplePayload,
      signatureHeader: headerWithPrefix,
      webhookSecret: secret,
    });

    expect(event.session_id).toBe('sess_998877');
  });

  it('rejects an invalid signature with PKPayPlusSecurityError', () => {
    expect(() => {
      webhooks.constructEvent({
        payload: samplePayload,
        signatureHeader: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        webhookSecret: secret,
      });
    }).toThrow(PKPayPlusSecurityError);
  });

  it('rejects an empty signature header', () => {
    expect(() => {
      webhooks.constructEvent({
        payload: samplePayload,
        signatureHeader: '',
        webhookSecret: secret,
      });
    }).toThrow(PKPayPlusSecurityError);
  });
});
