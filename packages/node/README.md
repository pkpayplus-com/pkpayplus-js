# @pkpayplus/node

Official PKPay+ SDK for **Node.js**, **Express**, **NestJS**, **Fastify**, and **Hono** backend applications.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/node.svg)](https://www.npmjs.com/package/@pkpayplus/node)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node->=24.0.0-green.svg)](https://nodejs.org/)

---

## Installation

```bash
npm install @pkpayplus/node
# or
pnpm add @pkpayplus/node
```

---

## Initialization

```typescript
import { PKPayPlus } from '@pkpayplus/node';

export const pkpay = new PKPayPlus({
  secretKey: process.env.PKPAY_SECRET_KEY!, // sk_live_... or sk_test_...
  merchantId: process.env.PKPAY_MERCHANT_ID!, // Your merchant UUID from Dashboard
});
```

---

## Core Features & Examples

### 1. Create a Checkout Session

```typescript
const session = await pkpay.checkoutSessions.create({
  amount: 2500, // $25.00
  currency: 'USD',
  checkout_flow: 'iframe', // 'iframe' or 'redirect'
  customer: {
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
  success_url: 'https://example.com/checkout/success',
  cancel_url: 'https://example.com/checkout/cancel',
});

console.log('Session ID:', session.id);
console.log('Checkout URL:', session.checkout_url);
```

### 2. Verify Payment on Backend

```typescript
app.post('/api/checkout/verify', express.json(), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await pkpay.checkoutSessions.verify(sessionId);

    if (session.payment_status === 'paid') {
      // Fulfill customer order or grant entitlements
    }

    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      amount: session.amount,
      currency: session.currency,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
```

### 3. Products & Multi-Currency Prices

```typescript
// Create a Product
const product = await pkpay.products.create({
  name: 'Premium Plan',
  description: 'Annual subscription',
  unit_amount: 5000,
  currency: 'USD',
});

// Add another currency tier
await pkpay.prices.create(product.id, {
  currency: 'EUR',
  unit_amount: 4500,
});

// List products
const catalog = await pkpay.products.list({ page: 1, per_page: 20 });
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)
