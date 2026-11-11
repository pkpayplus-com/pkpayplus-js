import React, { useState, type ButtonHTMLAttributes } from 'react';
import { usePKPayPlus } from '../usePKPayPlus';

export interface PKPayPlusButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  createSessionEndpoint?: string;
  onSessionCreate?: () => Promise<{ iframe_url: string; session_id?: string }>;
  buttonText?: string;
  loadingText?: string;
  onSuccess?: (data: { sessionId: string; [key: string]: unknown }) => void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}

export function PKPayPlusButton({
  createSessionEndpoint,
  onSessionCreate,
  buttonText = 'Pay with PKPay+',
  loadingText = 'Preparing checkout...',
  onSuccess,
  onCancel,
  onError,
  disabled,
  className,
  style,
  onClick,
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
            'Accept': 'application/json',
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
      {isLoading ? loadingText : buttonText}
    </button>
  );
}

