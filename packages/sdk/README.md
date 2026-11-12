# @pkpayplus/sdk

Unified meta-package and Standalone CDN bundle for **PKPay+**.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/sdk.svg)](https://www.npmjs.com/package/@pkpayplus/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Installation (NPM)

```bash
npm install @pkpayplus/sdk
# or
pnpm add @pkpayplus/sdk
```

---

## Standalone CDN Usage (WordPress, Shopify, Webflow, Static HTML)

Include the standalone script tag directly on your webpage:

```html
<script src="https://cdn.jsdelivr.net/npm/@pkpayplus/sdk/dist/cdn/pkpayplus.global.min.global.js"></script>

<button onclick="pay()">Pay Now</button>

<script>
  function pay() {
    PKPayPlus.openDialog({
      url: 'https://checkout.pkpayplus.com/?session_id=sess_xxxxxx',
      onSuccess: function(data) {
        alert('Payment successful!');
      },
      onClose: function() {
        console.log('Dialog closed');
      }
    });
  }
</script>
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)

