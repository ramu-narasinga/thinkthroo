"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import PrivatePageGuard from "@/components/private-page-guard";

export default function RepositoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivatePageGuard>
      <div className="h-full px-6 overflow-x-hidden">
        {children}
      </div>
    </PrivatePageGuard>
  );
}
