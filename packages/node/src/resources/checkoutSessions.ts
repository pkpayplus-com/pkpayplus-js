import type {
  CheckoutSessionResponse,
  CreateCheckoutSessionParams,
  HTTPClient,
  VerifySessionResponse,
} from '@pkpayplus/core';

export class CheckoutSessionsResource {
  constructor(private readonly client: HTTPClient) {}

  public async create(params: CreateCheckoutSessionParams): Promise<CheckoutSessionResponse> {
    const merchantId = this.client.getMerchantId();
    const { idempotencyKey, ...payload } = params;

    return this.client.request<CheckoutSessionResponse>(
      'POST',
      `merchant-api/${merchantId}/checkout-sessions`,
      {
        body: payload,
        idempotencyKey,
      }
    );
  }

  public async verify(sessionId: string): Promise<VerifySessionResponse> {
    const merchantId = this.client.getMerchantId();
    return this.client.request<VerifySessionResponse>(
      'GET',
      `merchant-api/${merchantId}/${sessionId}`
    );
  }

  public async get(sessionId: string): Promise<VerifySessionResponse> {
    return this.verify(sessionId);
  }
}

