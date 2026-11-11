export type Currency = 'USD' | 'EUR' | 'GBP' | 'BDT' | 'CAD' | 'AUD' | 'JPY' | (string & {});

export type EnvironmentMode = 'live' | 'test';

export type CheckoutFlow = 'iframe' | 'redirect';

export interface Address {
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface CustomerInfo {
  email: string;
  name?: string;
  phone?: string;
  billing?: Address;
  shipping?: Address;
}

export interface CartItem {
  name: string;
  quantity: number;
  unit_price: number;
  description?: string;
  sku?: string;
}

export interface CreateCheckoutSessionParams {
  amount: number;
  currency: Currency;
  description?: string;
  checkout_flow?: CheckoutFlow;
  success_url?: string;
  cancel_url?: string;
  customer?: CustomerInfo;
  cart?: {
    items: CartItem[];
  };
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  expires_in_minutes?: number;
}

export interface CheckoutSessionResponse {
  session_id: string;
  expires_at: string;
  iframe_url: string | null;
  redirect_url: string | null;
}

export interface VerifySessionResponse {
  success: boolean;
  session_id: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'canceled' | 'expired';
  amount: number;
  currency: Currency;
  paid_at: string | null;
  description?: string;
  metadata?: Record<string, unknown>;
}

export type ProductStatus = 'draft' | 'published' | 'archived';

export interface CreateProductParams {
  name: string;
  currency: Currency;
  unit_amount: number; // in minor units / cents
  description?: string;
  short_description?: string;
  sku?: string;
  barcode?: string;
  status?: ProductStatus;
  is_virtual?: boolean;
  is_downloadable?: boolean;
  compare_at_amount?: number;
  cost_amount?: number;
  tax_included?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  sku?: string;
  status: ProductStatus;
  mode: EnvironmentMode;
  created_at: string;
  updated_at: string;
  prices?: Price[];
}

export interface CreatePriceParams {
  currency: Currency;
  unit_amount: number;
  compare_at_amount?: number;
  cost_amount?: number;
  is_default?: boolean;
  active?: boolean;
  tax_included?: boolean;
}

export interface Price {
  id: string;
  product_id: string;
  currency: Currency;
  unit_amount: number;
  compare_at_amount?: number;
  is_default: boolean;
  active: boolean;
  created_at: string;
}

export interface PaymentLink {
  id: string;
  product_id: string;
  price_id: string;
  url: string;
  active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface PKPayPlusWebhookEvent<T = Record<string, unknown>> {
  id?: string;
  event: string;
  success: boolean;
  status: string;
  session_id: string;
  order_id?: string;
  transaction_id?: string;
  amount: number;
  currency: Currency;
  paid_at?: string;
  data?: T;
  created_at?: string;
}

export interface PKPayPlusServerOptions {
  secretKey: string;
  merchantId: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface PKPayPlusClientOptions {
  publishableKey: string;
  mode?: EnvironmentMode;
  checkoutDomain?: string;
}

export interface OpenDialogOptions {
  url: string;
  onLoaded?: () => void;
  onSuccess?: (data: { sessionId: string; [key: string]: unknown }) => void;
  onCancel?: () => void;
  onError?: (error: { message: string; code?: string; [key: string]: unknown }) => void;
}

export interface DialogController {
  close: () => void;
  iframe: HTMLIFrameElement;
  container: HTMLDivElement;
}

