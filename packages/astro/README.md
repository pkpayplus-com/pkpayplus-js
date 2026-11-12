# @pkpayplus/astro

Official **Astro** SDK for **PKPay+** with support for server-side endpoints and client-side dialogs.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/astro.svg)](https://www.npmjs.com/package/@pkpayplus/astro)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install @pkpayplus/astro
# or
pnpm add @pkpayplus/astro
```

---

## Usage in Astro

### 1. Server Endpoint (`src/pages/api/checkout.ts`)

```typescript
import type { APIRoute } from 'astro';
import { getPKPayPlusServer } from '@pkpayplus/astro';

export const POST: APIRoute = async () => {
  const pkpay = getPKPayPlusServer();

  const session = await pkpay.checkoutSessions.create({
    amount: 1500,
    currency: 'USD',
    checkout_flow: 'iframe',
  });

  return new Response(JSON.stringify({ sessionId: session.id }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### 2. Client Page (`src/pages/index.astro`)

```astro
---
---
<button id="pay-btn">Pay Now</button>

<script>
  import { openPKPayPlusDialog } from '@pkpayplus/astro';

  document.getElementById('pay-btn')?.addEventListener('click', async () => {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const { sessionId } = await res.json();

    openPKPayPlusDialog({
      sessionId,
      onSuccess: () => alert('Payment completed!'),
    });
  });
</script>
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)
