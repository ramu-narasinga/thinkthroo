"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@thinkthroo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs";
import PrivatePageGuard from "@/components/private-page-guard";

const tabs = [
  { label: "Codebase Architecture", value: "architecture" },
  { label: "Reviews", value: "reviews" },
  { label: "Settings", value: "settings" },
];

export default function RepositoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const repository = params.repository as string;

  // Get the current tab from the path
  const currentTab = pathname.split("/").pop();

  const handleTabChange = (value: string) => {
    router.push(`/repositories/${repository}/${value}`);
  };

  return (
    <PrivatePageGuard>
      <div className="h-full px-6 space-y-2">

        {/* Tab Navigation */}
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Tab Content */}
        <div className="mt-4">{children}</div>
      </div>
    </PrivatePageGuard>
  );
}
