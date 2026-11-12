import {
  createCheckoutDialog,
  type DialogController,
  type OpenDialogOptions,
  type PKPayPlusClientOptions,
} from '@pkpayplus/core';
import type { App, InjectionKey } from 'vue';
import { inject } from 'vue';

export const PKPAYPLUS_KEY: InjectionKey<PKPayPlusClientOptions> = Symbol('PKPAYPLUS_KEY');

export class PKPayPlusVueClient {
  constructor(public readonly options: PKPayPlusClientOptions) {}

  public openDialog(options: OpenDialogOptions): DialogController {
    return createCheckoutDialog(options);
  }
}

let activeDialog: DialogController | null = null;

export function usePKPayPlus(customOptions?: PKPayPlusClientOptions) {
  const injectedOptions = inject(PKPAYPLUS_KEY, null);
  const resolvedOptions = customOptions || injectedOptions;

  const openDialog = (options: OpenDialogOptions): DialogController => {
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }

    const dialog = createCheckoutDialog({
      ...options,
      onCancel: () => {
        activeDialog = null;
        options.onCancel?.();
      },
      onSuccess: (data) => {
        activeDialog = null;
        options.onSuccess?.(data);
      },
      onError: (err) => {
        activeDialog = null;
        options.onError?.(err);
      },
    });

    activeDialog = dialog;
    return dialog;
  };

  const closeDialog = () => {
    if (activeDialog) {
      activeDialog.close();
      activeDialog = null;
    }
  };

  return {
    openDialog,
    closeDialog,
    options: resolvedOptions,
  };
}

export const PKPayPlusPlugin = {
  install(app: App, options: PKPayPlusClientOptions) {
    app.provide(PKPAYPLUS_KEY, options);
  },
};

export * from '@pkpayplus/core';
