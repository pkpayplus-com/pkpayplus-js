import React, { type ButtonHTMLAttributes, useState } from 'react';
import { usePKPayPlus } from '../usePKPayPlus';

export interface PKPayPlusButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  createSessionEndpoint?: string;
  onSessionCreate?: () => Promise<{ iframe_url: string; session_id?: string }>;
  buttonText?: React.ReactNode;
  loading?: React.ReactNode;
  loadingText?: React.ReactNode;
  onSuccess?: (data: { sessionId: string; [key: string]: unknown }) => void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

export function PKPayPlusButton({
  createSessionEndpoint,
  onSessionCreate,
  buttonText = 'Pay with PKPay+',
  loading,
  loadingText,
  onSuccess,
  onCancel,
  onError,
  disabled,
  className,
  style,
  onClick,
  children,
  ...restProps
}: PKPayPlusButtonProps): React.JSX.Element {
  const { openDialog } = usePKPayPlus();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.isDefaultPrevented()) return;

    if (!createSessionEndpoint && !onSessionCreate) {
      console.error(
        '[PKPayPlusButton]: You must provide either "createSessionEndpoint" or "onSessionCreate" prop.'
      );
      return;
    }

    try {
      setIsLoading(true);
      let iframeUrl = '';

      if (onSessionCreate) {
        const result = await onSessionCreate();
        iframeUrl = result.iframe_url;
      } else if (createSessionEndpoint) {
        const response = await fetch(createSessionEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to create checkout session: ${response.statusText}`);
        }

        const data = await response.json();
        iframeUrl = data.iframe_url || data.iframeUrl;
      }

      if (!iframeUrl) {
        throw new Error('No iframe_url returned from checkout session endpoint.');
      }

      openDialog({
        url: iframeUrl,
        onSuccess,
        onCancel,
        onError,
      });
    } catch (err: unknown) {
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      data-loading={isLoading ? '' : undefined}
      onClick={handleClick}
      className={className}
      style={{
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        fontSize: '15px',
        fontWeight: 600,
        borderRadius: '8px',
        border: 'none',
        background: '#2563eb',
        color: '#ffffff',
        transition: 'background 0.2s ease',
        ...style,
      }}
      {...restProps}
    >
      {isLoading ? (loading ?? loadingText ?? 'Preparing checkout...') : (children ?? buttonText)}
    </button>
  );
}
