# PKPay+ NPM Package Ecosystem — Architecture & Complete API Reference

> **Ecosystem Structure**: pnpm Workspaces Monorepo  
> **Backend Integration**: PKPay+ Merchant Backend ([Laravel 12 / PostgreSQL])  
> **Runtime Baseline**: Node.js `>=24.0.0` | React `19.x` | Next.js `15 & 16`  
> **Design Philosophy**: Dedicated framework packages — zero confusing `/client` subpaths.

---

## 1. Monorepo Package Matrix

| Package Name | Purpose / Framework Target | Primary Exports & Methods |
| :--- | :--- | :--- |
| **`@pkpayplus/core`** | Universal shared engine & types | `HTTPClient`, `createCheckoutDialog`, `setupPostMessageListener`, `Webhooks`, errors & domain models |
| **`@pkpayplus/node`** | Node.js, Express, NestJS, Fastify, Hono | `PKPayPlus` (`checkoutSessions`, `products`, `prices`, `paymentLinks`, `webhooks`) |
| **`@pkpayplus/react`** | React 19 SPA, Vite, Remix, CRA | `PKPayPlusProvider`, `usePKPayPlus()`, `PKPayPlusButton`, `PKPayPlusDialog` |
| **`@pkpayplus/nextjs`** | Next.js 15 & 16 App Router | `pkpayServer`, `createWebhookHandler`, `getPKPayPlusServer`, `PKPayPlusProvider`, `usePKPayPlus()`, `PKPayPlusButton` |
| **`@pkpayplus/vue`** | Vue 3 & Nuxt 3 | `PKPayPlusPlugin`, `usePKPayPlus()` (`openDialog`, `closeDialog`) |
| **`@pkpayplus/svelte`** | Svelte 4 & 5, SvelteKit | `usePKPayPlus()` (`openDialog`, `closeDialog`) |
| **`@pkpayplus/astro`** | Astro (Static & SSR) | `getPKPayPlusServer()`, `openPKPayPlusDialog()` |
| **`@pkpayplus/sdk`** | Unified meta-package & CDN `<script>` | `PKPayPlus.init()`, `openDialog()`, `dialog.close()` |

---

## 2. Complete Method Reference & Code Examples

### 2.1 `@pkpayplus/node` (Backend Services)

Install:
```bash
npm install @pkpayplus/node
```

Initialization:
```typescript
import { PKPayPlus } from '@pkpayplus/node';

const pkpay = new PKPayPlus({
  secretKey: process.env.PKPAY_SECRET_KEY!,
  merchantId: process.env.PKPAY_MERCHANT_ID!,
  baseUrl: 'https://api.pkpayplus.com', // optional, defaults to production
  timeout: 10000,                       // optional (10s default)
  maxRetries: 2,                        // optional auto-retry on 5xx errors
});
```

#### Checkout Sessions (`pkpay.checkoutSessions`)
```typescript
// 1. Create a Checkout Session
const session = await pkpay.checkoutSessions.create({
  amount: 49.99,
  currency: 'USD',
  description: 'Order #10023',
  checkout_flow: 'iframe', // 'iframe' or 'redirect'
  success_url: 'https://merchant.com/order/success',
  cancel_url: 'https://merchant.com/order/cancel',
  customer: {
    email: 'buyer@example.com',
    name: 'Jane Doe',
    phone: '+14155552671',
    billing: {
      address_1: '123 Market St',
      city: 'San Francisco',
      country: 'US',
      postcode: '94103',
    },
  },
  cart: {
    items: [
      { name: 'Developer Plan', quantity: 1, unit_price: 49.99, sku: 'DEV-PLAN' },
    ],
  },
  metadata: {
    internal_order_id: 'ord_998877',
  },
  idempotencyKey: 'idemp_unique_key_123', // optional idempotency
});

console.log(session.session_id);  // UUID string
console.log(session.iframe_url);  // URL to mount in dialog
console.log(session.redirect_url);// URL for full redirect flow

// 2. Verify a Session (Server-to-Server)
const verification = await pkpay.checkoutSessions.verify(session.session_id);
if (verification.status === 'paid') {
  console.log(`Payment confirmed of ${verification.amount} ${verification.currency}`);
}

// 3. Alias for verify
const sameVerification = await pkpay.checkoutSessions.get(session.session_id);
```

#### Products Management (`pkpay.products`)
```typescript
// 1. Create a Product
const product = await pkpay.products.create({
  name: 'Annual SaaS Plan',
  currency: 'USD',
  unit_amount: 29900, // in minor units ($299.00 = 29900 cents)
  description: 'Full access to all platform features for 1 year',
  sku: 'SAAS-ANNUAL-01',
  status: 'published', // 'draft' | 'published' | 'archived'
  is_virtual: true,
  tax_included: false,
});

// 2. Get a Product by ID
const fetchedProduct = await pkpay.products.get(product.id);

// 3. List Products (with filtering & pagination)
const productList = await pkpay.products.list({
  page: 1,
  per_page: 20,
  search: 'SaaS',
  status: 'published',
  currency: 'USD',
});
console.log(`Found ${productList.total} products`);

// 4. Update a Product
const updatedProduct = await pkpay.products.update(product.id, {
  name: 'Annual SaaS Plan (Updated)',
  status: 'published',
});

// 5. Delete a Product
const deleteResult = await pkpay.products.delete(product.id);
```

#### Price Tiers (`pkpay.prices`)
```typescript
// 1. Add an additional currency price tier to a product
const eurPrice = await pkpay.prices.create(product.id, {
  currency: 'EUR',
  unit_amount: 26900, // €269.00
  compare_at_amount: 32000,
  is_default: false,
  active: true,
});

// 2. List all prices for a product
const allPrices = await pkpay.prices.list(product.id);

// 3. Update a price tier
const updatedPrice = await pkpay.prices.update(product.id, eurPrice.id, {
  unit_amount: 24900,
});

// 4. Delete a price tier
await pkpay.prices.delete(product.id, eurPrice.id);
```

#### Payment Links (`pkpay.paymentLinks`)
```typescript
// 1. Create a Payment Link
const link = await pkpay.paymentLinks.create(product.id, {
  price_id: eurPrice.id,
  metadata: { campaign: 'black_friday' },
});

// 2. List Payment Links for a Product
const links = await pkpay.paymentLinks.list(product.id);

// 3. Get a specific Payment Link
const singleLink = await pkpay.paymentLinks.get(product.id, link.id);

// 4. Update a Payment Link
await pkpay.paymentLinks.update(product.id, link.id, { active: false });

// 5. Delete a Payment Link
await pkpay.paymentLinks.delete(product.id, link.id);
```

#### Webhooks Verification (`pkpay.webhooks`)
```typescript
// Express raw body example
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const event = pkpay.webhooks.constructEvent({
      payload: req.body, // raw string or Buffer
      signatureHeader: req.headers['x-pkpayplus-signature'] as string,
      webhookSecret: process.env.PKPAY_WEBHOOK_SECRET!,
    });

    switch (event.event) {
      case 'payment.succeeded':
        console.log(`Order paid: ${event.session_id}`);
        break;
      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

---

### 2.2 `@pkpayplus/nextjs` (Next.js 15 & 16 App Router)

Install:
```bash
npm install @pkpayplus/nextjs
```

Environment Setup (`.env.local`):
```env
PKPAY_SECRET_KEY=sk_live_xxxxxx
PKPAY_MERCHANT_ID=8f7e6d5c-xxxx-xxxx
NEXT_PUBLIC_PKPAY_KEY=pk_live_xxxxxx
PKPAY_WEBHOOK_SECRET=whsec_xxxxxx
```

#### Server Actions (`app/actions/checkout.ts`)
```typescript
'use server';

import { pkpayServer } from '@pkpayplus/nextjs/server';

export async function createCheckoutSession(amount: number) {
  // pkpayServer auto-discovers PKPAY_SECRET_KEY and PKPAY_MERCHANT_ID
  const session = await pkpayServer.checkoutSessions.create({
    amount,
    currency: 'USD',
    checkout_flow: 'iframe',
  });

  return {
    iframeUrl: session.iframe_url!,
    sessionId: session.session_id,
  };
}
```

#### Client UI Component (`app/checkout/page.tsx`)
```tsx
'use client';

import {
  PKPayPlusProvider,
  usePKPayPlus,
  PKPayPlusButton,
  PKPayPlusDialog,
} from '@pkpayplus/nextjs';
import { useState } from 'react';
import { createCheckoutSession } from '../actions/checkout';

function CheckoutPageContent() {
  const { openDialog, closeDialog } = usePKPayPlus();
  const [dialogUrl, setDialogUrl] = useState<string | null>(null);

  // Method 1: Drop-in PKPayPlusButton with Server Action
  const buttonExample = (
    <PKPayPlusButton
      onSessionCreate={async () => {
        const { iframeUrl, sessionId } = await createCheckoutSession(49.99);
        return { iframe_url: iframeUrl, session_id: sessionId };
      }}
      buttonText="Buy with PKPay+"
      loadingText="Opening payment dialog..."
      onSuccess={(data) => alert(`Payment successful for order: ${data.sessionId}`)}
      onCancel={() => console.log('Payment canceled')}
      onError={(err) => console.error('Payment error:', err)}
    />
  );

  // Method 2: Imperative usePKPayPlus hook
  const hookExample = (
    <button
      onClick={async () => {
        const { iframeUrl, sessionId } = await createCheckoutSession(49.99);
        const controller = openDialog({
          url: iframeUrl,
          onLoaded: () => console.log('Dialog loaded'),
          onSuccess: (data) => alert(`Paid! ${data.sessionId}`),
          onCancel: () => console.log('User closed dialog'),
          onError: (err) => console.error('Error:', err),
        });

        // Can also close programmatically:
        // setTimeout(() => controller.close(), 30000);
      }}
    >
      Pay via Hook
    </button>
  );

  // Method 3: Declarative PKPayPlusDialog component
  const declarativeExample = (
    <>
      <button onClick={async () => {
        const { iframeUrl } = await createCheckoutSession(49.99);
        setDialogUrl(iframeUrl);
      }}>
        Open Declarative Dialog
      </button>

      <PKPayPlusDialog
        isOpen={Boolean(dialogUrl)}
        url={dialogUrl || ''}
        onClose={() => setDialogUrl(null)}
        onSuccess={(data) => {
          alert(`Paid: ${data.sessionId}`);
          setDialogUrl(null);
        }}
      />
    </>
  );

  return (
    <div className="space-y-4">
      {buttonExample}
      {hookExample}
      {declarativeExample}
    </div>
  );
}

export default function Page() {
  // PKPayPlusProvider auto-detects NEXT_PUBLIC_PKPAY_KEY from process.env
  return (
    <PKPayPlusProvider>
      <CheckoutPageContent />
    </PKPayPlusProvider>
  );
}
```

#### Drop-in Webhook Route Handler (`app/api/webhook/pkpay/route.ts`)
```typescript
import { createWebhookHandler } from '@pkpayplus/nextjs/server';

// Automatically reads raw text, extracts x-pkpayplus-signature, and verifies HMAC
export const POST = createWebhookHandler({
  onPaymentSuccess: async (event) => {
    console.log(`Payment confirmed for session: ${event.session_id}`);
    // e.g. await db.orders.update({ status: 'paid' })
  },
  onPaymentFailed: async (event) => {
    console.log(`Payment failed for session: ${event.session_id}`);
  },
  onEvent: async (event) => {
    console.log(`Generic event received: ${event.event}`);
  },
});
```

---

### 2.3 `@pkpayplus/react` (React 19 SPA)

Install:
```bash
npm install @pkpayplus/react
```

Usage:
```tsx
import React, { useState } from 'react';
import {
  PKPayPlusProvider,
  usePKPayPlus,
  PKPayPlusButton,
  PKPayPlusDialog,
  PKPayPlusClient,
} from '@pkpayplus/react';

function App() {
  return (
    <PKPayPlusProvider publishableKey="pk_live_xxxxxx">
      <StorePage />
    </PKPayPlusProvider>
  );
}

function StorePage() {
  const { openDialog, closeDialog } = usePKPayPlus();
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  return (
    <div>
      {/* 1. Prebuilt Button with backend API endpoint */}
      <PKPayPlusButton
        createSessionEndpoint="/api/create-session"
        buttonText="Checkout with PKPay+"
        onSuccess={(data) => alert('Payment completed: ' + data.sessionId)}
      />

      {/* 2. Hook-driven custom UI */}
      <button onClick={async () => {
        const res = await fetch('/api/create-session', { method: 'POST' });
        const { iframe_url } = await res.json();

        const dialog = openDialog({
          url: iframe_url,
          onSuccess: (data) => console.log('Paid:', data.sessionId),
          onCancel: () => console.log('Closed'),
        });
      }}>
        Custom Pay Button
      </button>

      {/* 3. Declarative Dialog */}
      <PKPayPlusDialog
        isOpen={Boolean(activeUrl)}
        url={activeUrl || ''}
        onClose={() => setActiveUrl(null)}
        onSuccess={(data) => alert('Paid: ' + data.sessionId)}
      />
    </div>
  );
}
```

---

### 2.4 `@pkpayplus/vue` (Vue 3 & Nuxt 3)

Install:
```bash
npm install @pkpayplus/vue
```

Plugin Registration (`main.ts`):
```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { PKPayPlusPlugin } from '@pkpayplus/vue';

const app = createApp(App);
app.use(PKPayPlusPlugin, { publishableKey: 'pk_live_xxxxxx' });
app.mount('#app');
```

Vue Component (`Checkout.vue`):
```vue
<script setup lang="ts">
import { usePKPayPlus } from '@pkpayplus/vue';

const { openDialog, closeDialog } = usePKPayPlus();

async function handlePay() {
  const res = await fetch('/api/create-session', { method: 'POST' });
  const { iframe_url } = await res.json();

  const dialog = openDialog({
    url: iframe_url,
    onLoaded: () => console.log('Checkout ready'),
    onSuccess: (data) => {
      console.log('Payment successful:', data.sessionId);
    },
    onCancel: () => console.log('User canceled'),
    onError: (err) => console.error('Payment error:', err),
  });

  // Programmatic close if needed:
  // dialog.close();
}
</script>

<template>
  <button @click="handlePay" class="btn-primary">
    Pay Now with PKPay+
  </button>
</template>
```

---

### 2.5 `@pkpayplus/svelte` (Svelte 4 & 5)

Install:
```bash
npm install @pkpayplus/svelte
```

Svelte Component (`Checkout.svelte`):
```svelte
<script lang="ts">
  import { usePKPayPlus } from '@pkpayplus/svelte';

  const { openDialog, closeDialog } = usePKPayPlus();

  async function handleCheckout() {
    const res = await fetch('/api/create-session', { method: 'POST' });
    const { iframe_url } = await res.json();

    openDialog({
      url: iframe_url,
      onSuccess: (data) => alert('Payment completed: ' + data.sessionId),
      onCancel: () => console.log('Dialog dismissed'),
      onError: (err) => console.error(err),
    });
  }
</script>

<button on:click={handleCheckout}>
  Pay with PKPay+
</button>
```

---

### 2.6 `@pkpayplus/astro` (Astro SSR & Client)

Install:
```bash
npm install @pkpayplus/astro
```

Astro Page (`src/pages/checkout.astro`):
```astro
---
import { getPKPayPlusServer } from '@pkpayplus/astro';

// Runs on server during SSR
let iframeUrl = '';
if (Astro.request.method === 'POST') {
  const pkpay = getPKPayPlusServer();
  const session = await pkpay.checkoutSessions.create({
    amount: 35.00,
    currency: 'USD',
  });
  iframeUrl = session.iframe_url!;
}
---

<html>
  <body>
    <form method="POST">
      <button type="submit">Generate Checkout Dialog</button>
    </form>

    {iframeUrl && (
      <script define:vars={{ iframeUrl }}>
        import { openPKPayPlusDialog } from '@pkpayplus/astro';
        openPKPayPlusDialog({
          url: iframeUrl,
          onSuccess: (data) => alert('Paid: ' + data.sessionId),
        });
      </script>
    )}
  </body>
</html>
```

---

### 2.7 `@pkpayplus/sdk` (Standalone CDN Script)

Include in HTML `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@pkpayplus/sdk@latest/dist/cdn/pkpayplus.global.min.js"></script>
```

Usage in JavaScript:
```html
<button id="buy-btn">Pay $25.00</button>

<script>
  // 1. Initialize client
  const pkpay = PKPayPlus.init({
    publishableKey: 'pk_live_xxxxxxxxxxxxxxxx'
  });

  // 2. Open dialog
  document.getElementById('buy-btn').addEventListener('click', async () => {
    const res = await fetch('/create-order.php', { method: 'POST' });
    const data = await res.json();

    const dialog = pkpay.openDialog({
      url: data.iframe_url,
      onLoaded: function() {
        console.log('Dialog loaded');
      },
      onSuccess: function(result) {
        window.location.href = '/thank-you?order_id=' + result.sessionId;
      },
      onCancel: function() {
        console.log('User closed dialog');
      },
      onError: function(err) {
        console.error('Payment error', err);
      }
    });

    // Programmatic close if needed:
    // dialog.close();
  });
</script>
```

---

## 3. Monorepo Commands Reference

```bash
# Install dependencies across all packages
pnpm install

# Build all 8 packages in parallel
pnpm run build

# Run Vitest test suites (15 passing tests)
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run TypeScript typechecks
pnpm run typecheck

# Clean all build outputs
pnpm run clean

# Publish all packages to NPM
pnpm -r publish --access public
```
