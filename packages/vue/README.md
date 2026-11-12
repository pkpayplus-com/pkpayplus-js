# @pkpayplus/vue

Official **Vue 3** and **Nuxt 3** SDK for **PKPay+** with composables and plugin integration.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/vue.svg)](https://www.npmjs.com/package/@pkpayplus/vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install @pkpayplus/vue
# or
pnpm add @pkpayplus/vue
```

---

## Usage in Vue 3 / Nuxt 3

### In your main app:

```typescript
import { createApp } from 'vue';
import { PKPayPlusPlugin } from '@pkpayplus/vue';
import App from './App.vue';

const app = createApp(App);
app.use(PKPayPlusPlugin, {
  publishableKey: 'pk_live_xxxxxx',
});
app.mount('#app');
```

### In your component (`Checkout.vue`):

```vue
<script setup lang="ts">
import { usePKPayPlus } from '@pkpayplus/vue';

const { openDialog, isDialogOpen } = usePKPayPlus();

const startPayment = async () => {
  const res = await fetch('/api/create-session', { method: 'POST' });
  const { sessionId } = await res.json();

  openDialog({
    sessionId,
    onSuccess: (data) => console.log('Payment successful:', data),
    onClose: () => console.log('Dialog closed'),
  });
};
</script>

<template>
  <button :disabled="isDialogOpen" @click="startPayment">
    Pay with PKPay+
  </button>
</template>
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)
