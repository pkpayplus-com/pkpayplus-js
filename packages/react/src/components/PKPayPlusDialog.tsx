import type { DialogController } from '@pkpayplus/core';
import { useEffect, useRef } from 'react';
import { usePKPayPlus } from '../usePKPayPlus';

export interface PKPayPlusDialogProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onSuccess?: (data: { sessionId: string; [key: string]: unknown }) => void;
  onError?: (error: unknown) => void;
  onLoaded?: () => void;
}

export function PKPayPlusDialog({
  isOpen,
  url,
  onClose,
  onSuccess,
  onError,
  onLoaded,
}: PKPayPlusDialogProps): null {
  const { openDialog } = usePKPayPlus();
  const dialogRef = useRef<DialogController | null>(null);

  useEffect(() => {
    if (isOpen && url) {
      dialogRef.current = openDialog({
        url,
        onLoaded,
        onSuccess: (data) => {
          onSuccess?.(data);
          onClose();
        },
        onCancel: () => {
          onClose();
        },
        onError: (err) => {
          onError?.(err);
          onClose();
        },
      });
    } else if (!isOpen && dialogRef.current) {
      dialogRef.current.close();
      dialogRef.current = null;
    }

    return () => {
      if (dialogRef.current) {
        dialogRef.current.close();
        dialogRef.current = null;
      }
    };
  }, [isOpen, url, openDialog, onClose, onSuccess, onError, onLoaded]);

  return null;
}
