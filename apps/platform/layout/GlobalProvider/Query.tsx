'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

import { lambdaQuery, lambdaQueryClient } from '@/lib/trpc/client';

// React Query logs errors internally via console.error before QueryCache.onError runs.
// Patch console.error once at module load to suppress expected UNAUTHORIZED errors.
if (typeof window !== 'undefined') {
  const _originalConsoleError = console.error.bind(console);
  console.error = (...args: any[]) => {
    const msg = args[0];
    if (
      (typeof msg === 'string' && msg.includes('UNAUTHORIZED')) ||
      (msg instanceof Error && msg.message?.includes('UNAUTHORIZED')) ||
      (typeof msg === 'object' && msg?.message?.includes('UNAUTHORIZED'))
    ) {
      return; // swallow silently — expected for unauthenticated blurred pages
    }
    _originalConsoleError(...args);
  };
}

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any) => {
            // Suppress UNAUTHORIZED errors silently — these are expected when
            // unauthenticated users view the blurred preview of private pages.
            if (error?.data?.code === 'UNAUTHORIZED' || error?.message === 'UNAUTHORIZED') {
              return;
            }
            console.error(error);
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              if (error?.data?.code === 'UNAUTHORIZED' || error?.message === 'UNAUTHORIZED') {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      }),
  );
  // Cast required because pnpm installs separate QueryClient type instances for trpc and app
  const providerQueryClient = queryClient as unknown as React.ComponentProps<
    typeof lambdaQuery.Provider
  >['queryClient'];

  return (
    <lambdaQuery.Provider client={lambdaQueryClient} queryClient={providerQueryClient}>
      <QueryClientProvider client={queryClient}>{children as any}</QueryClientProvider>
    </lambdaQuery.Provider>
  );
};

export default QueryProvider;