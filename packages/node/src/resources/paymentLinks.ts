import type { HTTPClient, PaymentLink } from '@pkpayplus/core';

export class PaymentLinksResource {
  constructor(private readonly client: HTTPClient) {}

  public async list(productId: string): Promise<PaymentLink[]> {
    return this.client.request<PaymentLink[]>(
      'GET',
      `merchant-api/products/${productId}/payment-links`
    );
  }

  public async create(productId: string, params: Record<string, unknown>): Promise<PaymentLink> {
    return this.client.request<PaymentLink>(
      'POST',
      `merchant-api/products/${productId}/payment-links`,
      {
        body: params,
      }
    );
  }

  public async get(productId: string, linkId: string): Promise<PaymentLink> {
    return this.client.request<PaymentLink>(
      'GET',
      `merchant-api/products/${productId}/payment-links/${linkId}`
    );
  }

  public async update(
    productId: string,
    linkId: string,
    params: Record<string, unknown>
  ): Promise<PaymentLink> {
    return this.client.request<PaymentLink>(
      'PUT',
      `merchant-api/products/${productId}/payment-links/${linkId}`,
      { body: params }
    );
  }

  public async delete(
    productId: string,
    linkId: string
  ): Promise<{ success: boolean; message?: string }> {
    return this.client.request<{ success: boolean; message?: string }>(
      'DELETE',
      `merchant-api/products/${productId}/payment-links/${linkId}`
    );
  }
}
