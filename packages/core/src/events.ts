export interface PostMessageHandlers {
  targetUrl: string;
  onLoaded?: () => void;
  onSuccess?: (data: { sessionId: string; [key: string]: unknown }) => void;
  onCancel?: () => void;
  onError?: (error: { message: string; code?: string; [key: string]: unknown }) => void;
}

export function setupPostMessageListener(handlers: PostMessageHandlers): () => void {
  let expectedOrigin = '';
  try {
    const urlObj = new URL(handlers.targetUrl, window.location.href);
    expectedOrigin = urlObj.origin;
  } catch {
    expectedOrigin = '';
  }

  const listener = (event: MessageEvent) => {
    if (expectedOrigin && event.origin !== expectedOrigin && !event.origin.includes('pkpayplus.com')) {
      return;
    }

    const payload = event.data;
    if (!payload || typeof payload !== 'object') {
      return;
    }

    const eventType = payload.type || payload.event;

    switch (eventType) {
      case 'pkpayplus:loaded':
      case 'pkpay:loaded':
        handlers.onLoaded?.();
        break;

      case 'pkpayplus:completed':
      case 'pkpayplus:success':
      case 'pkpay:completed':
      case 'payment.succeeded':
        handlers.onSuccess?.({
          sessionId: payload.sessionId || payload.session_id || payload.data?.sessionId || '',
          ...(payload.data || {}),
        });
        break;

      case 'pkpayplus:canceled':
      case 'pkpayplus:cancelled':
      case 'pkpay:canceled':
        handlers.onCancel?.();
        break;

      case 'pkpayplus:error':
      case 'pkpay:error':
        handlers.onError?.({
          message: payload.message || payload.error?.message || 'Payment failed',
          code: payload.code || payload.error?.code,
          ...(payload.error || {}),
        });
        break;

      default:
        break;
    }
  };

  window.addEventListener('message', listener);

  return () => {
    window.removeEventListener('message', listener);
  };
}

