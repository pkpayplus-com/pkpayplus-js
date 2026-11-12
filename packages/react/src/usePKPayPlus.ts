import type { DialogController, OpenDialogOptions } from '@pkpayplus/core';
import { useCallback, useRef } from 'react';
import { usePKPayPlusContext } from './context';

export interface UsePKPayPlusReturn {
  client: ReturnType<typeof usePKPayPlusContext>['client'];
  openDialog: (options: OpenDialogOptions) => DialogController;
  closeDialog: () => void;
}

export function usePKPayPlus(): UsePKPayPlusReturn {
  const { client } = usePKPayPlusContext();
  const currentDialogRef = useRef<DialogController | null>(null);

  const openDialog = useCallback(
    (options: OpenDialogOptions): DialogController => {
      if (currentDialogRef.current) {
        currentDialogRef.current.close();
      }

      const dialog = client.openDialog({
        ...options,
        onCancel: () => {
          currentDialogRef.current = null;
          options.onCancel?.();
        },
        onSuccess: (data) => {
          currentDialogRef.current = null;
          options.onSuccess?.(data);
        },
        onError: (err) => {
          currentDialogRef.current = null;
          options.onError?.(err);
        },
      });

      currentDialogRef.current = dialog;
      return dialog;
    },
    [client]
  );

  const closeDialog = useCallback(() => {
    if (currentDialogRef.current) {
      currentDialogRef.current.close();
      currentDialogRef.current = null;
    }
  }, []);

  return {
    client,
    openDialog,
    closeDialog,
  };
}
