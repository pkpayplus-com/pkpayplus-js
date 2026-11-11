export class PKPayPlusError extends Error {
  public readonly statusCode?: number;
  public readonly code?: string;
  public readonly raw?: unknown;

  constructor(message: string, options?: { statusCode?: number; code?: string; raw?: unknown }) {
    super(message);
    this.name = 'PKPayPlusError';
    this.statusCode = options?.statusCode;
    this.code = options?.code;
    this.raw = options?.raw;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PKPayPlusAuthenticationError extends PKPayPlusError {
  constructor(message = 'Invalid or inactive PKPay+ API key') {
    super(message, { statusCode: 401, code: 'authentication_error' });
    this.name = 'PKPayPlusAuthenticationError';
  }
}

export class PKPayPlusInvalidRequestError extends PKPayPlusError {
  constructor(message: string, raw?: unknown) {
    super(message, { statusCode: 400, code: 'invalid_request_error', raw });
    this.name = 'PKPayPlusInvalidRequestError';
  }
}

export class PKPayPlusRateLimitError extends PKPayPlusError {
  constructor(message = 'PKPay+ API rate limit exceeded') {
    super(message, { statusCode: 429, code: 'rate_limit_error' });
    this.name = 'PKPayPlusRateLimitError';
  }
}

export class PKPayPlusAPIConnectionError extends PKPayPlusError {
  constructor(message = 'Failed to connect to PKPay+ API') {
    super(message, { statusCode: 0, code: 'connection_error' });
    this.name = 'PKPayPlusAPIConnectionError';
  }
}

export class PKPayPlusSecurityError extends PKPayPlusError {
  constructor(message: string) {
    super(message, { statusCode: 403, code: 'security_violation' });
    this.name = 'PKPayPlusSecurityError';
  }
}

