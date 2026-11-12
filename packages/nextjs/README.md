# @pkpayplus/nextjs

Official **Next.js 15 & 16 App Router** SDK for **PKPay+**. Built with first-class support for **React 19**, **Server Actions**, **Route Handlers**, and Client Checkout Dialogs.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/nextjs.svg)](https://www.npmjs.com/package/@pkpayplus/nextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/next.js-15.x%20|%2016.x-black.svg)](https://nextjs.org/)

---

## Installation

```bash
npm install @pkpayplus/nextjs
# or
pnpm add @pkpayplus/nextjs
```

---

## Configuration (`.env.local`)

```env
PKPAY_SECRET_KEY=sk_live_xxxxxx
PKPAY_MERCHANT_ID=8f7e6d5c-xxxx-xxxx
NEXT_PUBLIC_PKPAY_KEY=pk_live_xxxxxx
```

---

## Usage

### 1. Server Action (`app/actions/checkout.ts`)

```typescript
'use server';

import { pkpayServer } from '@pkpayplus/nextjs/server';

export async function createCheckout(amount: number) {
  // Automatically discovers PKPAY_SECRET_KEY and PKPAY_MERCHANT_ID from env
  const session = await pkpayServer.checkoutSessions.create({
    amount,
    currency: 'USD',
    checkout_flow: 'iframe',
    success_url: 'https://example.com/checkout/success',
    cancel_url: 'https://example.com/checkout/cancel',
  });

  return { sessionId: session.id };
}
```

### 2. Client Checkout UI (`app/pricing/page.tsx`)

```tsx
'use client';

import { PKPayPlusProvider, usePKPayPlus } from '@pkpayplus/nextjs';
import { createCheckout } from '../actions/checkout';

function CheckoutButton() {
  const { openDialog } = usePKPayPlus();

  const handlePay = async () => {
    const { sessionId } = await createCheckout(2900);
    openDialog({ sessionId });
  };

  return <button onClick={handlePay}>Subscribe ($29/mo)</button>;
}

export default function PricingPage() {
  return (
    <PKPayPlusProvider>
      <CheckoutButton />
    </PKPayPlusProvider>
  );
}
```

### 3. Server Route Handler for Verification (`app/api/checkout/verify/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { pkpayServer } from '@pkpayplus/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    const session = await pkpayServer.checkoutSessions.verify(sessionId);

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      amount: session.amount,
      currency: session.currency,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)

