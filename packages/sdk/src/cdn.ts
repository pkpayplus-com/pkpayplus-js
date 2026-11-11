import {
  createCheckoutDialog,
  type DialogController,
  type OpenDialogOptions,
  type PKPayPlusClientOptions,
} from '@pkpayplus/core';

export class PKPayPlusCDNClient {
  constructor(public readonly options: PKPayPlusClientOptions) {}

  public static init(options: PKPayPlusClientOptions) {
    return new PKPayPlusCDNClient(options);
  }

  public openDialog(options: OpenDialogOptions): DialogController {
    return createCheckoutDialog(options);
  }
}

if (typeof window !== 'undefined') {
  (window as unknown as { PKPayPlus: typeof PKPayPlusCDNClient }).PKPayPlus = PKPayPlusCDNClient;
}

export default PKPayPlusCDNClient;
