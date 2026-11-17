import { createCheckoutDialog } from '@pkpayplus/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Client Dialog Controller', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Prevent happy-dom from making real network calls when iframe.src is set
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('<html><body>Mock Checkout</body></html>'));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    document.body.innerHTML = '';
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

    // Verify close button is mounted in dialog
    const closeBtn = document.querySelector('.pkpay-close-btn');
    expect(closeBtn).not.toBeNull();

    dialog.close();
  });

  it('triggers onCancel when close button is clicked', () => {
    const onCancel = vi.fn();
    const dialog = createCheckoutDialog({
      url: 'https://checkout.pkpayplus.com?session_id=sess_test',
      onCancel,
    });

    const closeBtn = dialog.container.querySelector('.pkpay-close-btn') as HTMLButtonElement | null;
    expect(closeBtn).not.toBeNull();
    closeBtn?.click();

    expect(onCancel).toHaveBeenCalledTimes(1);
    dialog.close();
  });
});
