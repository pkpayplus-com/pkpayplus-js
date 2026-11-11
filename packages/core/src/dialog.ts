import type { DialogController, OpenDialogOptions } from './types';
import { setupPostMessageListener } from './events';

const DIALOG_STYLE_ID = 'pkpayplus-dialog-styles';

function injectDialogStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(DIALOG_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = DIALOG_STYLE_ID;
  style.textContent = `
    .pkpayplus-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      padding: 16px;
    }
    .pkpayplus-overlay.pkpayplus-visible {
      opacity: 1;
    }
    .pkpayplus-dialog {
      position: relative;
      width: 100%;
      max-width: 480px;
      height: 92vh;
      max-height: 720px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      transform: scale(0.96) translateY(12px);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }
    .pkpayplus-visible .pkpayplus-dialog {
      transform: scale(1) translateY(0);
    }
    .pkpayplus-iframe {
      width: 100%;
      height: 100%;
      border: none;
      flex: 1;
      background: transparent;
    }
    .pkpayplus-close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(241, 245, 249, 0.9);
      border: 1px solid rgba(203, 213, 225, 0.8);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
      font-size: 18px;
      line-height: 1;
      z-index: 10;
      transition: background 0.15s ease, transform 0.1s ease;
    }
    .pkpayplus-close-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: scale(1.05);
    }
    @media (max-width: 640px) {
      .pkpayplus-overlay {
        padding: 0;
      }
      .pkpayplus-dialog {
        max-width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export function createCheckoutDialog(options: OpenDialogOptions): DialogController {
  if (typeof document === 'undefined') {
    throw new Error('createCheckoutDialog can only be invoked in a browser environment with window and document.');
  }

  injectDialogStyles();

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const overlay = document.createElement('div');
  overlay.className = 'pkpayplus-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'pkpayplus-dialog';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'pkpayplus-close-btn';
  closeBtn.setAttribute('aria-label', 'Close PKPay+ Checkout');
  closeBtn.innerHTML = '&times;';

  const iframe = document.createElement('iframe');
  iframe.className = 'pkpayplus-iframe';
  iframe.src = options.url;
  iframe.setAttribute('allow', 'payment *; camera *');
  iframe.setAttribute('title', 'PKPay+ Secure Checkout');

  dialog.appendChild(closeBtn);
  dialog.appendChild(iframe);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('pkpayplus-visible');
  });

  let isClosed = false;

  const cleanup = () => {
    if (isClosed) return;
    isClosed = true;

    document.body.style.overflow = previousOverflow;
    overlay.classList.remove('pkpayplus-visible');
    cleanupEvents();
    window.removeEventListener('keydown', handleKeyDown);

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 250);
  };

  const handleClose = () => {
    cleanup();
    options.onCancel?.();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  closeBtn.addEventListener('click', handleClose);
  window.addEventListener('keydown', handleKeyDown);

  const cleanupEvents = setupPostMessageListener({
    targetUrl: options.url,
    onLoaded: () => options.onLoaded?.(),
    onSuccess: (data) => {
      cleanup();
      options.onSuccess?.(data);
    },
    onCancel: () => {
      cleanup();
      options.onCancel?.();
    },
    onError: (error) => {
      cleanup();
      options.onError?.(error);
    },
  });

  return {
    close: cleanup,
    iframe,
    container: overlay,
  };
}

