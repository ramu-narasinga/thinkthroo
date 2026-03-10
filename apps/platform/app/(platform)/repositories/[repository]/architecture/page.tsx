'use client';

import dynamic from 'next/dynamic';
import * as Sentry from '@sentry/nextjs';

const ArchitectureTab = dynamic(() => import('./components/ArchitectureTab'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500">Loading…</p>
    </div>
  ),
});

export default function ArchitecturePage() {
  Sentry.logger.info(
    Sentry.logger.fmt`Architecture page loaded`,
    { timestamp: new Date().toISOString() }
  );
  return <ArchitectureTab />;
}
