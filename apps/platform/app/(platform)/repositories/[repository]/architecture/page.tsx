'use client';

import dynamic from 'next/dynamic';

const ArchitectureTab = dynamic(() => import('./components/ArchitectureTab'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500">Loading…</p>
    </div>
  ),
});

export default function ArchitecturePage() {
  return <ArchitectureTab />;
}
