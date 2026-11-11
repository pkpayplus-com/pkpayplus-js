import { describe, expect, it } from 'vitest';
import { PKPayPlus, PKPayPlusAuthenticationError, PKPayPlusInvalidRequestError } from '@pkpayplus/node';

describe('PKPayPlus Server SDK Initialization', () => {
  it('initializes successfully with secretKey and merchantId', () => {
    const pkpay = new PKPayPlus({
      secretKey: 'sk_live_1234567890',
      merchantId: 'merch_uuid_123',
    });

    expect(pkpay.getMerchantId()).toBe('merch_uuid_123');
    expect(pkpay.products).toBeDefined();
    expect(pkpay.prices).toBeDefined();
    expect(pkpay.checkoutSessions).toBeDefined();
    expect(pkpay.sessions).toBe(pkpay.checkoutSessions);
    expect(pkpay.paymentLinks).toBeDefined();
    expect(pkpay.webhooks).toBeDefined();
  });

  it('throws PKPayPlusAuthenticationError if secretKey is missing', () => {
    expect(() => {
      // @ts-expect-error testing missing secretKey
      new PKPayPlus({ merchantId: 'merch_123' });
    }).toThrow(PKPayPlusAuthenticationError);
  });

  it('throws PKPayPlusInvalidRequestError if merchantId is missing', () => {
    expect(() => {
      // @ts-expect-error testing missing merchantId
      new PKPayPlus({ secretKey: 'sk_live_123' });
    }).toThrow(PKPayPlusInvalidRequestError);
  });
});

