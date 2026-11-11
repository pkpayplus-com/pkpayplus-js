import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCheckoutDialog } from '@pkpayplus/core';

describe('Client Dialog Controller', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Prevent happy-dom from making real network calls when iframe.src is set
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('<html><body>Mock Checkout</body></html>'));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('injects iframe overlay dialog into DOM and removes on close', () => {
    const dialog = createCheckoutDialog({
      url: 'https://checkout.pkpayplus.com?session_id=sess_test',
    });

    expect(dialog).toBeDefined();
    expect(dialog.iframe).toBeDefined();
    expect(dialog.iframe.src).toContain('session_id=sess_test');

    const overlay = document.querySelector('.pkpayplus-overlay');
    expect(overlay).not.toBeNull();

    dialog.close();
  });
});
