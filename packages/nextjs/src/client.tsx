import React from 'react';
import {
  PKPayPlusProvider as BasePKPayPlusProvider,
  type PKPayPlusProviderProps,
} from '@pkpayplus/react';

export function PKPayPlusProvider({
  publishableKey,
  ...rest
}: Partial<PKPayPlusProviderProps> & { children: React.ReactNode }): React.JSX.Element {
  const resolvedKey =
    publishableKey ||
    (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_PKPAY_KEY : undefined);

  if (!resolvedKey) {
    throw new Error(
      '[PKPayPlus Next.js Error]: Missing publishableKey prop or NEXT_PUBLIC_PKPAY_KEY environment variable.'
    );
  }

  return <BasePKPayPlusProvider publishableKey={resolvedKey} {...rest} />;
}

export * from '@pkpayplus/react';

