'use client';

import { createContext, useContext, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const FallbackContext = createContext<boolean>(false);

export const useFallbackMode = () => useContext(FallbackContext);

export default function AppWrapper({
  children,
  isFallbackMode,
}: {
  children: React.ReactNode;
  isFallbackMode: boolean;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute cache
        retry: isFallbackMode ? false : 2, // Don't retry if we know we are offline
      },
    },
  }))
  return (
    <QueryClientProvider client={queryClient}>

      <FallbackContext.Provider value={isFallbackMode}>
        {children}
      </FallbackContext.Provider>
    </QueryClientProvider>
  );
}