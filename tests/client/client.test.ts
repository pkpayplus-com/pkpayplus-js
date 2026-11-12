import { PKPayPlusSecurityError } from '@pkpayplus/core';
import { PKPayPlusClient } from '@pkpayplus/react';
import { describe, expect, it } from 'vitest';

describe('PKPayPlusClient', () => {
  it('initializes correctly with publishableKey', () => {
    const client = PKPayPlusClient.init({
      publishableKey: 'pk_live_abcdef123456',
    });

    expect(client.publishableKey).toBe('pk_live_abcdef123456');
    expect(client.mode).toBe('live');
  });

  it('detects test mode from pk_test_ prefix', () => {
    const client = PKPayPlusClient.init({
      publishableKey: 'pk_test_abcdef123456',
    });

    expect(client.mode).toBe('test');
  });

  it('immediately throws PKPayPlusSecurityError if a Secret Key is passed', () => {
    expect(() => {
      PKPayPlusClient.init({
        publishableKey: 'sk_live_secret123456',
      });
    }).toThrow(PKPayPlusSecurityError);

    expect(() => {
      PKPayPlusClient.init({
        publishableKey: 'sk_test_secret123456',
      });
    }).toThrow(PKPayPlusSecurityError);
  });
});
