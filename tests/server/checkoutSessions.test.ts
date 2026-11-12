import { PKPayPlus } from '@pkpayplus/node';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('CheckoutSessions Resource', () => {
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

  it('creates a checkout session with correct merchant_id route parameter', async () => {
    const mockResponse = {
      session_id: 'sess_123',
      expires_at: '2026-11-12T00:00:00Z',
      iframe_url: 'https://checkout.pkpayplus.com?session_id=sess_123',
      redirect_url: null,
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockResponse),
    });

    const session = await pkpay.checkoutSessions.create({
      amount: 49.99,
      currency: 'USD',
      description: 'Test Order',
      customer: { email: 'buyer@example.com' },
    });

    expect(session.session_id).toBe('sess_123');
    expect(session.iframe_url).toContain('sess_123');

    // Verify fetch was called with the correct route interpolation
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(calledUrl).toBe(
      'https://api.test.pkpayplus.com/merchant-api/merch_001/checkout-sessions'
    );
    expect(calledOptions?.method).toBe('POST');
    expect(calledOptions?.headers).toMatchObject({
      Authorization: 'Bearer sk_test_1234567890',
      'Content-Type': 'application/json',
    });
  });

  it('verifies a checkout session with correct merchant_id and session_id route parameters', async () => {
    const mockVerification = {
      success: true,
      session_id: 'sess_123',
      status: 'paid',
      amount: 49.99,
      currency: 'USD',
      paid_at: '2026-11-11T12:00:00Z',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockVerification),
    });

    const result = await pkpay.checkoutSessions.verify('sess_123');

    expect(result.status).toBe('paid');
    expect(result.session_id).toBe('sess_123');

    const [calledUrl, calledOptions] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(calledUrl).toBe('https://api.test.pkpayplus.com/merchant-api/merch_001/sess_123');
    expect(calledOptions?.method).toBe('GET');
  });
});
