import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PKPayPlus } from '@pkpayplus/node';

describe('Products & Prices Resource', () => {
  const pkpay = new PKPayPlus({
    secretKey: 'sk_test_1234567890',
    merchantId: 'merch_001',
    baseUrl: 'https://api.test.pkpayplus.com',
  });

  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('creates a product with unit_amount and currency', async () => {
    const mockProduct = {
      id: 'prod_101',
      merchant_id: 'merch_001',
      name: 'Test Plan',
      status: 'published',
      mode: 'test',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockProduct),
    });

    const product = await pkpay.products.create({
      name: 'Test Plan',
      currency: 'USD',
      unit_amount: 2900,
      sku: 'PLAN-001',
    });

    expect(product.id).toBe('prod_101');
    const [calledUrl, calledOptions] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(calledUrl).toBe('https://api.test.pkpayplus.com/merchant-api/products');
    expect(calledOptions?.method).toBe('POST');
  });

  it('creates a price tier for an existing product', async () => {
    const mockPrice = {
      id: 'price_202',
      product_id: 'prod_101',
      currency: 'EUR',
      unit_amount: 2500,
      is_default: false,
      active: true,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockPrice),
    });

    const price = await pkpay.prices.create('prod_101', {
      currency: 'EUR',
      unit_amount: 2500,
    });

    expect(price.id).toBe('price_202');
    const [calledUrl] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(calledUrl).toBe('https://api.test.pkpayplus.com/merchant-api/products/prod_101/prices');
  });
});

