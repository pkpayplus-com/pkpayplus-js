import {
  HTTPClient,
  type PKPayPlusServerOptions,
  Webhooks,
} from '@pkpayplus/core';
import { CheckoutSessionsResource } from './resources/checkoutSessions';
import { PaymentLinksResource } from './resources/paymentLinks';
import { PricesResource } from './resources/prices';
import { ProductsResource } from './resources/products';

export class PKPayPlus {
  private readonly client: HTTPClient;

  public readonly products: ProductsResource;
  public readonly prices: PricesResource;
  public readonly checkoutSessions: CheckoutSessionsResource;
  public readonly sessions: CheckoutSessionsResource;
  public readonly paymentLinks: PaymentLinksResource;
  public readonly webhooks: Webhooks;

  constructor(options: PKPayPlusServerOptions) {
    this.client = new HTTPClient(options);

    this.products = new ProductsResource(this.client);
    this.prices = new PricesResource(this.client);
    this.checkoutSessions = new CheckoutSessionsResource(this.client);
    this.sessions = this.checkoutSessions;
    this.paymentLinks = new PaymentLinksResource(this.client);
    this.webhooks = new Webhooks();
  }

  public getMerchantId(): string {
    return this.client.getMerchantId();
  }

  public getBaseUrl(): string {
    return this.client.getBaseUrl();
  }
}

export * from '@pkpayplus/core';
export * from './resources/checkoutSessions';
export * from './resources/paymentLinks';
export * from './resources/prices';
export * from './resources/products';

export default PKPayPlus;

