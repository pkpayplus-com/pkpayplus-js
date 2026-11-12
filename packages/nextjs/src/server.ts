import type { PKPayPlusServerOptions, PKPayPlusWebhookEvent } from '@pkpayplus/core';
import { PKPayPlus } from '@pkpayplus/node';

let serverInstance: PKPayPlus | null = null;

export function getPKPayPlusServer(options?: Partial<PKPayPlusServerOptions>): PKPayPlus {
  const secretKey = options?.secretKey || process.env.PKPAY_SECRET_KEY;
  const merchantId = options?.merchantId || process.env.PKPAY_MERCHANT_ID;
  const baseUrl = options?.baseUrl || process.env.PKPAY_BASE_URL;

  if (!secretKey) {
    throw new Error(
      '[PKPayPlus Next.js Error]: Missing "PKPAY_SECRET_KEY" environment variable or options.secretKey.'
    );
  }
  if (!merchantId) {
    throw new Error(
      '[PKPayPlus Next.js Error]: Missing "PKPAY_MERCHANT_ID" environment variable or options.merchantId.'
    );
  }

  if (!serverInstance || options) {
    serverInstance = new PKPayPlus({
      secretKey,
      merchantId,
      baseUrl,
      ...options,
    });
  }

  return serverInstance;
}

/**
 * Pre-configured PKPayPlus server instance initialized from environment variables
 */
export const pkpayServer = new Proxy({} as PKPayPlus, {
  get(_target, prop) {
    const instance = getPKPayPlusServer();
    return (instance as unknown as Record<string, unknown>)[prop as string];
  },
});

export interface WebhookHandlerOptions {
  webhookSecret?: string;
  onPaymentSuccess?: (event: PKPayPlusWebhookEvent) => Promise<void> | void;
  onPaymentFailed?: (event: PKPayPlusWebhookEvent) => Promise<void> | void;
  onEvent?: (event: PKPayPlusWebhookEvent) => Promise<void> | void;
}

/**
 * Drop-in App Router Route Handler for Next.js (app/api/webhook/pkpay/route.ts)
 */
export function createWebhookHandler(options?: WebhookHandlerOptions) {
  return async function handleWebhook(req: Request): Promise<Response> {
    try {
      const webhookSecret = options?.webhookSecret || process.env.PKPAY_WEBHOOK_SECRET;
      if (!webhookSecret) {
        return new Response('Webhook secret not configured', { status: 500 });
      }

      const signature =
        req.headers.get('x-pkpayplus-signature') ||
        req.headers.get('x-pkplus-signature') ||
        req.headers.get('x-pkpay-signature');

      if (!signature) {
        return new Response('Missing webhook signature header', { status: 400 });
      }

      const rawBody = await req.text();
      const server = getPKPayPlusServer();
      const event = server.webhooks.constructEvent({
        payload: rawBody,
        signatureHeader: signature,
        webhookSecret,
      });

      if (options?.onEvent) {
        await options.onEvent(event);
      }

      if (event.event === 'payment.succeeded' || event.status === 'paid') {
        if (options?.onPaymentSuccess) {
          await options.onPaymentSuccess(event);
        }
      } else if (event.status === 'failed' || event.event === 'payment.failed') {
        if (options?.onPaymentFailed) {
          await options.onPaymentFailed(event);
        }
      }

      return Response.json({ received: true });
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Webhook verification failed';
      return new Response(`Webhook Error: ${message}`, { status: 400 });
    }
  };
}

export * from '@pkpayplus/node';
