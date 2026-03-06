'use client';

import RepositoriesListPage from "./(list)/features/RepositoriesListPage";
import PrivatePageGuard from "@/components/private-page-guard";

export default function RepositoriesPage() {
  return (
    <PrivatePageGuard>
      <RepositoriesListPage />
    </PrivatePageGuard>
  );
}
