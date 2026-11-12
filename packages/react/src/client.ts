import {
  assertClientKey,
  createCheckoutDialog,
  type DialogController,
  detectModeFromKey,
  type OpenDialogOptions,
  type PKPayPlusClientOptions,
} from '@pkpayplus/core';

export class PKPayPlusClient {
  public readonly publishableKey: string;
  public readonly mode: 'live' | 'test';
  public readonly checkoutDomain: string;

  constructor(options: PKPayPlusClientOptions) {
    if (!options?.publishableKey) {
      throw new Error('Missing required "publishableKey" in PKPayPlusClient');
    }

    assertClientKey(options.publishableKey);

    this.publishableKey = options.publishableKey;
    this.mode = options.mode || detectModeFromKey(options.publishableKey);
    this.checkoutDomain = options.checkoutDomain || 'https://checkout.pkpayplus.com';
  }

  public static init(options: PKPayPlusClientOptions): PKPayPlusClient {
    return new PKPayPlusClient(options);
  }

  public openDialog(options: OpenDialogOptions): DialogController {
    return createCheckoutDialog(options);
  }
}
