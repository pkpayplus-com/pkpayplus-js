# @pkpayplus/core

The universal shared core engine, HTTP client, iframe dialog controller, event listeners, and domain models for the **PKPay+** SDK ecosystem.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/core.svg)](https://www.npmjs.com/package/@pkpayplus/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install @pkpayplus/core
# or
pnpm add @pkpayplus/core
```

---

## What's Included

- **`HTTPClient`**: Universal fetch-based HTTP transport with retries, exponential backoff, and standard PKPay+ error translation (`PKPayPlusAuthenticationError`, `PKPayPlusInvalidRequestError`, `PKPayPlusRateLimitError`, etc.).
- **`createCheckoutDialog`**: Headless DOM dialog/overlay injector for rendering secure PKPay+ iframe checkout.
- **`setupPostMessageListener`**: Type-safe cross-origin postMessage event listener (`pkpayplus:ready`, `pkpayplus:success`, `pkpayplus:close`).
- **TypeScript Types**: Complete definitions for `CheckoutSession`, `Product`, `Price`, `PaymentLink`, and checkout events.

---

## License

MIT © [PKPay+](https://pkpayplus.com)
