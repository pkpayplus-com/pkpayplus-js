import { setupPostMessageListener } from './events';
import type { CustomerInfo, DialogController, OpenDialogOptions } from './types';
import { createCustomerForm, type CustomerFormController } from './ui/customer-form';
import { injectThemeStyles } from './ui/theme';

export function createCheckoutDialog(options: OpenDialogOptions): DialogController {
  if (typeof document === 'undefined') {
    throw new Error(
      'createCheckoutDialog can only be invoked in a browser environment with window and document.'
    );
  }

  injectThemeStyles();

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const overlay = document.createElement('div');
  overlay.className = 'pkpay-overlay pkpayplus-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'pkpay-dialog';

  const showCustomer = options.showCustomerForm !== false;
  if (!showCustomer) {
    dialog.classList.add('pkpay-compact');
  }

  const iframePane = document.createElement('div');
  iframePane.className = 'pkpay-iframe-pane';

  // Close Button with SVG icon
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'pkpay-close-btn';
  closeBtn.setAttribute('aria-label', 'Close PKPay+ Checkout');
  closeBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  // Loader / Skeleton for Iframe
  const loader = document.createElement('div');
  loader.className = 'pkpay-iframe-loader';
  loader.innerHTML = `
    <div class="pkpay-spinner"></div>
    <span class="pkpay-loader-text">Loading secure payment...</span>
  `;

  // Checkout Iframe
  const iframe = document.createElement('iframe');
  iframe.className = 'pkpay-iframe';
  iframe.src = options.url;
  iframe.setAttribute('allow', 'payment *; camera *');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('title', 'PKPay+ Secure Checkout');

  const hideLoader = () => {
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 200);
  };

  iframe.addEventListener('load', hideLoader);

  // Sync customer information to iframe via postMessage
  const sendCustomerUpdateToIframe = (customer: CustomerInfo) => {
    try {
      const fullName = (customer.name || '').trim();

      const customerPayload = {
        type: 'pkplus_customer_update',
        event: 'pkplus_customer_update',
        data: {
          name: fullName,
          email: customer.email || '',
          phone: customer.phone || '',
          country: customer.billing?.country || 'US',
          address: customer.billing?.address_1 || '',
          city: customer.billing?.city || '',
          state: customer.billing?.state || '',
          postal_code: customer.billing?.postcode || '',
        },
      };

      iframe.contentWindow?.postMessage(customerPayload, '*');
    } catch {
      // Ignored if iframe is not ready
    }
  };

  let customerForm: CustomerFormController | null = null;

  if (showCustomer) {
    customerForm = createCustomerForm({
      initialData: options.customer,
      onChange: (customer) => {
        sendCustomerUpdateToIframe(customer);
      },
    });
    dialog.appendChild(customerForm.element);
  }

  // Payment Header (Screenshot 2 style)
  const paymentHeader = document.createElement('div');
  paymentHeader.className = 'pkpay-payment-header';
  paymentHeader.innerHTML = `
    <div class="pkpay-payment-title-row">
      <span class="pkpay-payment-title">
        <span class="pkpay-radio-dot"></span>
        PKPay+ Secured Checkout
      </span>
      <div class="pkpay-brand-badges">
        <span class="pkpay-brand-badge">VISA</span>
        <span class="pkpay-brand-badge">MC</span>
        <span class="pkpay-brand-badge">AMEX</span>
        <span class="pkpay-brand-badge">GPAY</span>
      </div>
    </div>
    <p class="pkpay-payment-subtitle">Pay with your credit or debit card via our secure payment gateway.</p>
  `;

  // Card Box framing the iframe (Screenshot 2 style)
  const cardBox = document.createElement('div');
  cardBox.className = 'pkpay-card-box';
  cardBox.appendChild(loader);
  cardBox.appendChild(iframe);

  // Modern processing overlay over the card box to replace raw iframe verification text
  const processingOverlay = document.createElement('div');
  processingOverlay.className = 'pkpay-processing-overlay';
  processingOverlay.innerHTML = `
    <div class="pkpay-spinner" style="width: 26px; height: 26px; border-width: 2.5px; border-color: #cbd5e1; border-top-color: #2563eb;"></div>
    <p class="pkpay-processing-text">Verifying device & processing...</p>
    <p class="pkpay-processing-subtext">Please do not close or refresh this window</p>
  `;
  cardBox.appendChild(processingOverlay);

  // Privacy / Terms Notice (Screenshot 2 style)
  const termsNotice = document.createElement('p');
  termsNotice.className = 'pkpay-terms-notice';
  termsNotice.textContent = 'Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.';

  // Error alert area in right pane if payment encounters issue
  const errorAlert = document.createElement('div');
  errorAlert.className = 'pkpay-form-message';
  errorAlert.style.marginBottom = '10px';
  errorAlert.style.padding = '8px 12px';
  errorAlert.style.borderRadius = '6px';
  errorAlert.style.background = '#fef2f2';
  errorAlert.style.border = '1px solid #fecaca';

  // Pay Now Action Button (triggers inline elements checkout)
  const payBtn = document.createElement('button');
  payBtn.type = 'button';
  payBtn.className = 'pkpay-submit-btn';
  payBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span>Pay Now</span>
  `;

  let isCardReady = false;
  let paymentTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleCardReadyMessage = (event: MessageEvent) => {
    if (event.data?.event === 'pkplus_card_ready' || event.data?.event === 'paydios_card_ready') {
      isCardReady = Boolean(event.data?.ready);
      if (isCardReady && errorAlert.style.display === 'block') {
        errorAlert.style.display = 'none';
      }
    }
  };
  window.addEventListener('message', handleCardReadyMessage);

  const resetPayButton = () => {
    processingOverlay.classList.remove('pkpay-visible');
    if (paymentTimeout) {
      clearTimeout(paymentTimeout);
      paymentTimeout = null;
    }
    payBtn.disabled = false;
    payBtn.classList.remove('pkpay-loading');
    payBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <span>Pay Now</span>
    `;
  };

  payBtn.addEventListener('click', () => {
    errorAlert.style.display = 'none';

    // 1. Validate customer details if customer form is enabled
    if (customerForm) {
      const isValid = customerForm.validate();
      if (!isValid) {
        // Focus first invalid input
        const firstInvalid = customerForm.element.querySelector('.pkpay-input-error') as HTMLInputElement | null;
        firstInvalid?.focus();
        return;
      }
      sendCustomerUpdateToIframe(customerForm.getData());
    } else if (options.customer) {
      sendCustomerUpdateToIframe(options.customer);
    }

    // 2. Set button loading state & reveal card box processing overlay
    payBtn.disabled = true;
    payBtn.classList.add('pkpay-loading');
    payBtn.innerHTML = `
      <div class="pkpay-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
      <span>Processing payment...</span>
    `;
    processingOverlay.classList.add('pkpay-visible');

    // 3. Timeout fallback to prevent infinite loading state
    if (paymentTimeout) clearTimeout(paymentTimeout);
    paymentTimeout = setTimeout(() => {
      resetPayButton();
      errorAlert.textContent = 'Payment request timed out. Please check your card details and try again.';
      errorAlert.style.display = 'block';
    }, 25000);

    // 4. Dispatch canonical pkplus_place_order event to iframe with 100ms delay to allow React state commit
    setTimeout(() => {
      iframe.contentWindow?.postMessage(
        { event: 'pkplus_place_order' },
        '*'
      );
    }, 100);
  });

  dialog.appendChild(closeBtn);
  iframePane.appendChild(paymentHeader);
  iframePane.appendChild(cardBox);
  iframePane.appendChild(termsNotice);
  iframePane.appendChild(errorAlert);
  iframePane.appendChild(payBtn);
  dialog.appendChild(iframePane);

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('pkpay-visible');
  });

  let isClosed = false;

  const cleanup = () => {
    if (isClosed) return;
    isClosed = true;

    document.body.style.overflow = previousOverflow;
    overlay.classList.remove('pkpay-visible');
    if (paymentTimeout) {
      clearTimeout(paymentTimeout);
      paymentTimeout = null;
    }
    window.removeEventListener('message', handleCardReadyMessage);
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

  // Send initial customer data once iframe loads or announces ready
  const onReady = () => {
    hideLoader();
    if (customerForm) {
      sendCustomerUpdateToIframe(customerForm.getData());
    } else if (options.customer) {
      sendCustomerUpdateToIframe(options.customer);
    }
    options.onLoaded?.();
  };

  const cleanupEvents = setupPostMessageListener({
    targetUrl: options.url,
    onLoaded: onReady,
    onSuccess: (data) => {
      cleanup();
      options.onSuccess?.(data);
    },
    onCancel: () => {
      cleanup();
      options.onCancel?.();
    },
    onError: (error) => {
      resetPayButton();
      errorAlert.textContent = error.message || 'Payment failed. Please try again.';
      errorAlert.style.display = 'block';
      options.onError?.(error);
    },
  });

  return {
    close: cleanup,
    iframe,
    container: overlay,
    updateCustomer: (data: Partial<CustomerInfo>) => {
      customerForm?.setValues(data);
    },
  };
}
