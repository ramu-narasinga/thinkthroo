'use client';

import dynamic from 'next/dynamic';
import ArchitectureSkeleton from './components/ArchitectureSkeleton';

const ArchitectureTab = dynamic(() => import('./components/ArchitectureTab'), {
  loading: () => <ArchitectureSkeleton />,
});

export default function ArchitecturePage() {
  return <ArchitectureTab />;
}
