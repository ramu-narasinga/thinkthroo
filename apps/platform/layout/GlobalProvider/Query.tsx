'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

import { lambdaQuery, lambdaQueryClient } from '@/lib/trpc/client';

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
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