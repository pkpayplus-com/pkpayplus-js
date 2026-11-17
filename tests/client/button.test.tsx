import { PKPayPlusProvider } from '@pkpayplus/react';
import { PKPayPlusButton } from '@pkpayplus/react';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('PKPayPlusButton', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders default button text or custom buttonText', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <PKPayPlusProvider publishableKey="pk_test_1234567890">
          <PKPayPlusButton buttonText="Checkout Now" onSessionCreate={async () => ({ iframe_url: 'https://test.com' })} />
        </PKPayPlusProvider>
      );
    });

    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe('Checkout Now');
  });

  it('renders custom children when provided', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <PKPayPlusProvider publishableKey="pk_test_1234567890">
          <PKPayPlusButton onSessionCreate={async () => ({ iframe_url: 'https://test.com' })}>
            <span className="custom-child">Pay Custom</span>
          </PKPayPlusButton>
        </PKPayPlusProvider>
      );
    });

    const child = container.querySelector('.custom-child');
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe('Pay Custom');
  });

  it('displays custom loading prop during session creation', async () => {
    let resolveSession: (value: { iframe_url: string }) => void = () => {};
    const sessionPromise = new Promise<{ iframe_url: string }>((resolve) => {
      resolveSession = resolve;
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(
        <PKPayPlusProvider publishableKey="pk_test_1234567890">
          <PKPayPlusButton
            buttonText="Pay Now"
            loading={
              <span className="test-spinner-wrapper">
                <span className="test-spinner">🌀</span>
                <span>Connecting...</span>
              </span>
            }
            onSessionCreate={() => sessionPromise}
          />
        </PKPayPlusProvider>
      );
    });

    const button = container.querySelector('button');
    expect(button?.textContent).toBe('Pay Now');

    // Click to start loading
    await act(async () => {
      button?.click();
    });

    expect(button?.getAttribute('aria-busy')).toBe('true');
    expect(container.querySelector('.test-spinner')).not.toBeNull();
    expect(button?.textContent).toContain('Connecting...');

    // Resolve session
    await act(async () => {
      resolveSession({ iframe_url: 'https://checkout.pkpayplus.com?session_id=sess_123' });
    });
  });
});
