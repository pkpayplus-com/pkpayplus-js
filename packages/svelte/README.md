# @pkpayplus/svelte

Official **Svelte 4 & 5** and **SvelteKit** SDK for **PKPay+**.

[![npm version](https://img.shields.io/npm/v/@pkpayplus/svelte.svg)](https://www.npmjs.com/package/@pkpayplus/svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install @pkpayplus/svelte
# or
pnpm add @pkpayplus/svelte
```

---

## Usage in Svelte / SvelteKit

```svelte
<script lang="ts">
  import { usePKPayPlus } from '@pkpayplus/svelte';

  const { openDialog, isDialogOpen } = usePKPayPlus({
    publishableKey: 'pk_live_xxxxxx',
  });

  async function handleCheckout() {
    const res = await fetch('/api/create-session', { method: 'POST' });
    const { sessionId } = await res.json();

    openDialog({
      sessionId,
      onSuccess: (data) => alert('Payment completed!'),
      onClose: () => console.log('Closed'),
    });
  }
</script>

<button disabled={$isDialogOpen} on:click={handleCheckout}>
  Checkout with PKPay+
</button>
```

---

## License

MIT © [PKPay+](https://pkpayplus.com)

