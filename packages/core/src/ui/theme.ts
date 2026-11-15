export const THEME_STYLE_ID = 'pkpayplus-ui-theme';

export function injectThemeStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(THEME_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = THEME_STYLE_ID;
  style.textContent = `
    /* PKPay+ Modern Split Dialog Theme (shadcn/Radix aesthetics) */
    :root {
      --pkpay-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --pkpay-bg: #ffffff;
      --pkpay-sidebar-bg: #f8fafc;
      --pkpay-fg: #0f172a;
      --pkpay-muted: #64748b;
      --pkpay-muted-light: #94a3b8;
      --pkpay-border: #e2e8f0;
      --pkpay-border-hover: #cbd5e1;
      --pkpay-primary: #2563eb;
      --pkpay-primary-hover: #1d4ed8;
      --pkpay-ring: rgba(37, 99, 235, 0.25);
      --pkpay-destructive: #ef4444;
      --pkpay-radius: 12px;
      --pkpay-radius-sm: 6px;
    }

    @keyframes pkpay-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pkpay-slide-up {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(14px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes pkpay-error-reveal {
      from {
        opacity: 0;
        transform: translateY(-4px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 32px;
      }
    }

    .pkpay-overlay {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: var(--pkpay-font);
    }

    .pkpay-overlay.pkpay-visible {
      opacity: 1;
    }

    .pkpay-dialog {
      position: relative;
      width: 100%;
      max-width: 920px;
      min-height: 580px;
      height: auto;
      max-height: 94vh;
      background: var(--pkpay-bg);
      border-radius: var(--pkpay-radius);
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08);
      overflow: hidden;
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      transform: scale(0.96) translateY(14px);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }

    .pkpay-visible .pkpay-dialog {
      transform: scale(1) translateY(0);
    }

    /* Single column mode when customer form is disabled or pre-filled */
    .pkpay-dialog.pkpay-compact {
      max-width: 460px;
      grid-template-columns: 1fr;
    }

    /* Left Pane: Customer Information */
    .pkpay-customer-pane {
      display: flex;
      flex-direction: column;
      background: var(--pkpay-sidebar-bg);
      border-right: 1px solid var(--pkpay-border);
      overflow-y: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 24px;
      box-sizing: border-box;
    }

    .pkpay-customer-pane::-webkit-scrollbar {
      display: none;
    }

    .pkpay-pane-header {
      margin-bottom: 14px;
    }

    .pkpay-pane-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--pkpay-fg);
      margin: 0 0 3px 0;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .pkpay-pane-subtitle {
      font-size: 11px;
      color: var(--pkpay-muted);
      margin: 0;
      line-height: 1.4;
    }

    .pkpay-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }

    .pkpay-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .pkpay-form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      box-sizing: border-box;
    }

    .pkpay-label {
      font-size: 11.5px;
      font-weight: 500;
      color: var(--pkpay-fg);
      letter-spacing: -0.01em;
      user-select: none;
    }

    .pkpay-label-required {
      color: var(--pkpay-destructive);
      margin-left: 2px;
    }

    .pkpay-input {
      width: 100%;
      height: 36px;
      padding: 0 10px;
      font-size: 13px;
      font-family: inherit;
      color: var(--pkpay-fg);
      background: #ffffff;
      border: 1px solid var(--pkpay-border);
      border-radius: var(--pkpay-radius-sm);
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .pkpay-input::placeholder {
      color: var(--pkpay-muted-light);
    }

    .pkpay-input:hover {
      border-color: var(--pkpay-border-hover);
    }

    .pkpay-input:focus {
      border-color: var(--pkpay-primary);
      box-shadow: 0 0 0 3px var(--pkpay-ring);
    }

    .pkpay-input.pkpay-input-error {
      border-color: var(--pkpay-destructive);
    }

    .pkpay-input.pkpay-input-error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .pkpay-form-message {
      font-size: 11px;
      color: var(--pkpay-destructive);
      line-height: 1.2;
      display: none;
      animation: pkpay-error-reveal 0.15s ease-out;
    }

    .pkpay-form-message.pkpay-visible {
      display: block;
    }

    /* Combobox / Country Selector */
    .pkpay-combobox-wrapper {
      position: relative;
      width: 100%;
    }

    .pkpay-combobox-trigger {
      width: 100%;
      height: 36px;
      padding: 0 10px;
      font-size: 13px;
      font-family: inherit;
      color: var(--pkpay-fg);
      background: #ffffff;
      border: 1px solid var(--pkpay-border);
      border-radius: var(--pkpay-radius-sm);
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .pkpay-combobox-trigger:hover {
      border-color: var(--pkpay-border-hover);
    }

    .pkpay-combobox-trigger:focus,
    .pkpay-combobox-trigger.pkpay-active {
      border-color: var(--pkpay-primary);
      box-shadow: 0 0 0 3px var(--pkpay-ring);
      outline: none;
    }

    .pkpay-combobox-value {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pkpay-combobox-icon {
      color: var(--pkpay-muted);
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .pkpay-combobox-trigger.pkpay-active .pkpay-combobox-icon {
      transform: rotate(180deg);
    }

    .pkpay-combobox-popover {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid var(--pkpay-border);
      border-radius: var(--pkpay-radius-sm);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 50;
      display: none;
      flex-direction: column;
      overflow: hidden;
      max-height: 220px;
    }

    .pkpay-combobox-popover.pkpay-open {
      display: flex;
    }

    .pkpay-combobox-search-box {
      padding: 6px 8px;
      border-bottom: 1px solid var(--pkpay-border);
      display: flex;
      align-items: center;
      gap: 6px;
      background: #fdfdfd;
    }

    .pkpay-combobox-search-input {
      width: 100%;
      height: 28px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 12px;
      font-family: inherit;
      color: var(--pkpay-fg);
    }

    .pkpay-combobox-list {
      list-style: none;
      margin: 0;
      padding: 4px;
      overflow-y: auto;
      max-height: 170px;
      scrollbar-width: thin;
    }

    .pkpay-combobox-item {
      padding: 6px 8px;
      font-size: 12px;
      color: var(--pkpay-fg);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.1s ease;
    }

    .pkpay-combobox-item:hover,
    .pkpay-combobox-item.pkpay-highlighted {
      background: #f1f5f9;
    }

    .pkpay-combobox-item.pkpay-selected {
      font-weight: 600;
      background: #eff6ff;
      color: var(--pkpay-primary);
    }

    .pkpay-combobox-empty {
      padding: 12px;
      font-size: 12px;
      color: var(--pkpay-muted);
      text-align: center;
    }

    /* Right Pane: Iframe Checkout */
    .pkpay-iframe-pane {
      position: relative;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      width: 100%;
      height: 100%;
      overflow: hidden;
      padding: 24px;
      box-sizing: border-box;
    }

    .pkpay-payment-header {
      margin-bottom: 12px;
      padding-right: 32px;
    }

    .pkpay-payment-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 3px;
    }

    .pkpay-payment-title {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--pkpay-fg);
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: -0.01em;
    }

    .pkpay-radio-dot {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      border: 3.5px solid var(--pkpay-primary);
      background: #ffffff;
      display: inline-block;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .pkpay-brand-badges {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pkpay-brand-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 4px;
      border-radius: 3px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      color: #475569;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .pkpay-payment-subtitle {
      font-size: 11px;
      color: var(--pkpay-muted);
      margin: 0;
      line-height: 1.4;
    }

    .pkpay-card-box {
      position: relative;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 4px 6px;
      margin-bottom: 12px;
      box-sizing: border-box;
      overflow: hidden;
    }

    .pkpay-processing-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      z-index: 10;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      border-radius: 7px;
    }

    .pkpay-processing-overlay.pkpay-visible {
      opacity: 1;
      pointer-events: auto;
    }

    .pkpay-processing-text {
      font-size: 13.5px;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.01em;
    }

    .pkpay-processing-subtext {
      font-size: 11.5px;
      color: #64748b;
      margin: 0;
    }

    .pkpay-iframe {
      width: 100%;
      height: 285px;
      min-height: 285px;
      border: none;
      background: transparent;
      display: block;
      overflow: hidden;
    }

    .pkpay-terms-notice {
      font-size: 10.5px;
      color: var(--pkpay-muted);
      line-height: 1.45;
      margin: 0 0 12px 0;
    }

    .pkpay-submit-btn {
      width: 100%;
      height: 42px;
      border: none;
      border-radius: var(--pkpay-radius-sm);
      background: #0f172a;
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
      margin-top: auto;
    }

    .pkpay-submit-btn:hover:not(:disabled) {
      background: #1e293b;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }

    .pkpay-submit-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .pkpay-submit-btn.pkpay-loading {
      cursor: wait;
      opacity: 0.8;
    }

    .pkpay-iframe-loader {
      position: absolute;
      inset: 0;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 5;
      transition: opacity 0.2s ease;
    }

    .pkpay-spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(37, 99, 235, 0.15);
      border-top-color: var(--pkpay-primary);
      border-radius: 50%;
      animation: pkpay-spin 0.75s linear infinite;
    }

    @keyframes pkpay-spin {
      to { transform: rotate(360deg); }
    }

    .pkpay-loader-text {
      font-size: 12px;
      color: var(--pkpay-muted);
      font-weight: 500;
    }

    .pkpay-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #f1f5f9;
      border: 1px solid var(--pkpay-border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pkpay-muted);
      z-index: 20;
      transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
    }

    .pkpay-close-btn:hover {
      background: #e2e8f0;
      color: var(--pkpay-fg);
      transform: scale(1.05);
    }

    .pkpay-footer-badge {
      margin-top: auto;
      padding-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11px;
      color: var(--pkpay-muted);
      user-select: none;
    }

    /* Responsive Breakdown */
    @media (max-width: 768px) {
      .pkpay-overlay {
        padding: 0;
      }

      .pkpay-dialog {
        max-width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }

      .pkpay-customer-pane {
        border-right: none;
        border-bottom: 1px solid var(--pkpay-border);
        padding: 16px;
        max-height: 40vh;
      }

      .pkpay-form-row {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}
