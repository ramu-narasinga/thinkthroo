'use client';

import PrivatePageGuard from "@/components/private-page-guard";
import { OrganizationSettingsTab } from "./components/OrganizationSettingsTab";

export default function OrganizationSettingsPage() {
  return (
    <PrivatePageGuard>
      <OrganizationSettingsTab />
    </PrivatePageGuard>
  );
}
