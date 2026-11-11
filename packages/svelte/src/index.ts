import {
  createCheckoutDialog,
  type DialogController,
  type OpenDialogOptions,
  type PKPayPlusClientOptions,
} from '@pkpayplus/core';

let activeDialog: DialogController | null = null;

export function usePKPayPlus(_options?: PKPayPlusClientOptions) {
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
  };
}

export * from '@pkpayplus/core';
