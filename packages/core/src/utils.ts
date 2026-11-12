import { PKPayPlusSecurityError } from './errors';
import type { EnvironmentMode } from './types';

export function detectModeFromKey(key: string): EnvironmentMode {
  if (typeof key === 'string' && (key.startsWith('pk_test_') || key.startsWith('sk_test_'))) {
    return 'test';
  }
  return 'live';
}

export function assertServerEnvironment(): void {
  if (typeof window !== 'undefined') {
    console.error(
      '[PKPayPlus Security Warning]: You are running server code in a browser environment. ' +
        'Secret keys must remain strictly on your backend server!'
    );
  }
}

export function assertClientKey(key: string): void {
  if (typeof key === 'string' && (key.startsWith('sk_live_') || key.startsWith('sk_test_'))) {
    throw new PKPayPlusSecurityError(
      'You passed a Secret Key (sk_...) to a Client SDK instance. ' +
        'Secret keys must never be exposed to browser clients. Use your Publishable Key (pk_...) instead.'
    );
  }
}

export function assertServerKey(key: string): void {
  if (typeof key === 'string' && (key.startsWith('pk_live_') || key.startsWith('pk_test_'))) {
    console.warn(
      '[PKPayPlus Warning]: You passed a Publishable Key (pk_...) to the Server SDK. ' +
        'The server SDK requires your Secret Key (sk_...) to authorize administrative operations.'
    );
  }
}

export function normalizeUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
}
