import { createCheckoutDialog, type OpenDialogOptions } from '@pkpayplus/core';
import { PKPayPlus } from '@pkpayplus/node';

export function getPKPayPlusServer(): PKPayPlus {
  const secretKey = typeof process !== 'undefined' ? process.env.PKPAY_SECRET_KEY : undefined;
  const merchantId = typeof process !== 'undefined' ? process.env.PKPAY_MERCHANT_ID : undefined;

  if (!secretKey || !merchantId) {
    throw new Error(
      '[PKPayPlus Astro Error]: Missing PKPAY_SECRET_KEY or PKPAY_MERCHANT_ID environment variables.'
    );
  }

  return new PKPayPlus({ secretKey, merchantId });
}

export function openPKPayPlusDialog(options: OpenDialogOptions) {
  return createCheckoutDialog(options);
}

export * from '@pkpayplus/node';
