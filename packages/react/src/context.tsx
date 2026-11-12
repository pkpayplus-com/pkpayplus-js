import type { EnvironmentMode } from '@pkpayplus/core';
import React, { createContext, type ReactNode, useContext, useMemo } from 'react';
import { PKPayPlusClient } from './client';

export interface PKPayPlusContextValue {
  client: PKPayPlusClient;
}

export const PKPayPlusContext = createContext<PKPayPlusContextValue | null>(null);

export interface PKPayPlusProviderProps {
  publishableKey: string;
  mode?: EnvironmentMode;
  checkoutDomain?: string;
  children: ReactNode;
}

export function PKPayPlusProvider({
  publishableKey,
  mode,
  checkoutDomain,
  children,
}: PKPayPlusProviderProps): React.JSX.Element {
  const client = useMemo(() => {
    return new PKPayPlusClient({
      publishableKey,
      mode,
      checkoutDomain,
    });
  }, [publishableKey, mode, checkoutDomain]);

  return <PKPayPlusContext.Provider value={{ client }}>{children}</PKPayPlusContext.Provider>;
}

export function usePKPayPlusContext(): PKPayPlusContextValue {
  const context = useContext(PKPayPlusContext);
  if (!context) {
    throw new Error('usePKPayPlus must be used within a <PKPayPlusProvider>');
  }
  return context;
}
