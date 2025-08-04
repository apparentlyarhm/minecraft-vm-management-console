'use client';

import { createContext, useContext } from 'react';

const FallbackContext = createContext<boolean>(false);

export const useFallbackMode = () => useContext(FallbackContext);

export default function AppWrapper({
  children,
  isFallbackMode,
}: {
  children: React.ReactNode;
  isFallbackMode: boolean;
}) {
  return (
    <FallbackContext.Provider value={isFallbackMode}>
      {children}
    </FallbackContext.Provider>
  );
}