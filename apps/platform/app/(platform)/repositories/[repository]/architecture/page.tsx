'use client';

import ArchitectureTab from './components/ArchitectureTab';
import * as Sentry from '@sentry/nextjs';

export default function ArchitecturePage() {
  Sentry.logger.info(
    Sentry.logger.fmt`Architecture page loaded`,
    { timestamp: new Date().toISOString() }
  );
  return <ArchitectureTab />;
}
