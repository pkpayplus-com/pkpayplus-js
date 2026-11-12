import type { CreatePriceParams, HTTPClient, Price } from '@pkpayplus/core';

export class PricesResource {
  constructor(private readonly client: HTTPClient) {}

  public async create(productId: string, params: CreatePriceParams): Promise<Price> {
    return this.client.request<Price>('POST', `merchant-api/products/${productId}/prices`, {
      body: params,
    });
  }

  public async list(productId: string): Promise<Price[]> {
    return this.client.request<Price[]>('GET', `merchant-api/products/${productId}/prices`);
  }

  public async update(
    productId: string,
    priceId: string,
    params: Partial<CreatePriceParams>
  ): Promise<Price> {
    return this.client.request<Price>(
      'PUT',
      `merchant-api/products/${productId}/prices/${priceId}`,
      {
        body: params,
      }
    );
  }

  public async delete(
    productId: string,
    priceId: string
  ): Promise<{ success: boolean; message?: string }> {
    return this.client.request<{ success: boolean; message?: string }>(
      'DELETE',
      `merchant-api/products/${productId}/prices/${priceId}`
    );
  }
}
