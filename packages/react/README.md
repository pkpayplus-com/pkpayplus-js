# @pkpayplus/react

Official **React 19** SDK for **PKPay+** with built-in dialog checkout, hooks, and UI components. Compatible with Vite, Remix, Next.js, and Create React App.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/react.svg)](https://www.npmjs.com/package/@pkpayplus/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/react-19.x-blue.svg)](https://react.dev/)

---

## Installation

```bash
npm install @pkpayplus/react
# or
pnpm add @pkpayplus/react
```

---

## Quickstart

### 1. Wrap your application with `PKPayPlusProvider`

```tsx
import { PKPayPlusProvider } from '@pkpayplus/react';

export function App() {
  return (
    <PKPayPlusProvider
      publishableKey="pk_live_xxxxxx"
      onSuccess={(data) => console.log('Payment successful:', data)}
      onClose={() => console.log('Checkout closed')}
    >
      <CheckoutPage />
    </PKPayPlusProvider>
  );
}
```

### 2. Trigger Checkout via `usePKPayPlus` Hook

```tsx
import { usePKPayPlus } from '@pkpayplus/react';

export function CheckoutPage() {
  const { openDialog, isDialogOpen } = usePKPayPlus();

  const handlePay = async () => {
    // 1. Fetch sessionId from your server endpoint
    const res = await fetch('/api/create-session', { method: 'POST' });
    const { sessionId } = await res.json();

    // 2. Open the secure PKPay+ dialog
    openDialog({
      sessionId,
      onSuccess: (data) => alert('Payment complete!'),
    });
  };

  return (
    <button onClick={handlePay} disabled={isDialogOpen}>
      Pay with PKPay+
    </button>
  );
}
```

### 3. Or use the Pre-Built `PKPayPlusButton`

```tsx
import { PKPayPlusButton } from '@pkpayplus/react';

export function PricingCard() {
  return (
    <PKPayPlusButton
      getSessionId={async () => {
        const res = await fetch('/api/create-session', { method: 'POST' });
        const { sessionId } = await res.json();
        return sessionId;
      }}
      variant="primary"
    >
      Buy Now
    </PKPayPlusButton>
  );
}
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)
