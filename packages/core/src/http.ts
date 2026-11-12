import {
  PKPayPlusAPIConnectionError,
  PKPayPlusAuthenticationError,
  PKPayPlusError,
  PKPayPlusInvalidRequestError,
  PKPayPlusRateLimitError,
} from './errors';
import type { PKPayPlusServerOptions } from './types';
import { assertServerEnvironment, assertServerKey, normalizeUrl } from './utils';

export class HTTPClient {
  private readonly secretKey: string;
  private readonly merchantId: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(options: PKPayPlusServerOptions) {
    if (!options?.secretKey) {
      throw new PKPayPlusAuthenticationError(
        'Missing required "secretKey" in PKPayPlus configuration'
      );
    }
    if (!options?.merchantId) {
      throw new PKPayPlusInvalidRequestError(
        'Missing required "merchantId" in PKPayPlus configuration'
      );
    }

    assertServerEnvironment();
    assertServerKey(options.secretKey);

    this.secretKey = options.secretKey;
    this.merchantId = options.merchantId;
    this.baseUrl = options.baseUrl || 'https://api.pkpayplus.com';
    this.timeout = options.timeout ?? 10000;
    this.maxRetries = options.maxRetries ?? 2;
  }

  public getMerchantId(): string {
    return this.merchantId;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    options?: {
      body?: unknown;
      query?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
      idempotencyKey?: string;
    }
  ): Promise<T> {
    let fullUrl = normalizeUrl(this.baseUrl, path);

    if (options?.query) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      Accept: 'application/json',
      'PKPayPlus-Version': '2026-10-01',
      ...(options?.headers || {}),
    };

    if (options?.body) {
      headers['Content-Type'] = 'application/json';
    }

    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    let attempts = 0;
    const maxAttempts = 1 + this.maxRetries;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(fullUrl, {
          method,
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const rawText = await response.text();
        const responseData = isJson && rawText ? JSON.parse(rawText) : rawText;

        if (!response.ok) {
          this.handleHttpError(response.status, responseData);
        }

        return responseData as T;
      } catch (err: unknown) {
        const isLastAttempt = attempts >= maxAttempts;
        const isAbort = (err as Error)?.name === 'AbortError';

        if (err instanceof PKPayPlusError && err.statusCode && err.statusCode < 500) {
          throw err;
        }

        if (isLastAttempt) {
          if (err instanceof PKPayPlusError) {
            throw err;
          }
          if (isAbort) {
            throw new PKPayPlusAPIConnectionError(`Request timed out after ${this.timeout}ms`);
          }
          throw new PKPayPlusAPIConnectionError(
            (err as Error)?.message || 'Network request failed'
          );
        }

        const delay = Math.min(100 * 2 ** (attempts - 1) + Math.random() * 50, 2000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new PKPayPlusAPIConnectionError('Failed request after multiple retry attempts');
  }

  private handleHttpError(status: number, data: unknown): never {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : typeof data === 'object' && data !== null && 'error' in data
          ? String((data as { error: unknown }).error)
          : `Request failed with HTTP status ${status}`;

    if (status === 401) {
      throw new PKPayPlusAuthenticationError(message);
    }
    if (status === 429) {
      throw new PKPayPlusRateLimitError(message);
    }
    if (status >= 400 && status < 500) {
      throw new PKPayPlusInvalidRequestError(message, data);
    }

    throw new PKPayPlusError(message, { statusCode: status, raw: data });
  }
}
