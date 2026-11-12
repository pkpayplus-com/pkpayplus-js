import type { CreateProductParams, HTTPClient, Product } from '@pkpayplus/core';

export interface ProductListParams {
  mode?: string;
  search?: string;
  q?: string;
  status?: string;
  currency?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  per_page?: number;
}

export interface PaginatedProducts {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export class ProductsResource {
  constructor(private readonly client: HTTPClient) {}

  public async create(params: CreateProductParams): Promise<Product> {
    return this.client.request<Product>('POST', 'merchant-api/products', {
      body: params,
    });
  }

  public async get(id: string): Promise<Product> {
    return this.client.request<Product>('GET', `merchant-api/products/${id}`);
  }

  public async list(params?: ProductListParams): Promise<PaginatedProducts> {
    return this.client.request<PaginatedProducts>('GET', 'merchant-api/products', {
      query: params as Record<string, string | number | boolean | undefined>,
    });
  }

  public async update(id: string, params: Partial<CreateProductParams>): Promise<Product> {
    return this.client.request<Product>('PUT', `merchant-api/products/${id}`, {
      body: params,
    });
  }

  public async delete(id: string): Promise<{ success: boolean; message?: string }> {
    return this.client.request<{ success: boolean; message?: string }>(
      'DELETE',
      `merchant-api/products/${id}`
    );
  }
}
