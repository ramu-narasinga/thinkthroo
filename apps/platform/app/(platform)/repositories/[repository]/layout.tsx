"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import * as Sentry from '@sentry/nextjs';
import { Button } from "@thinkthroo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs";

const tabs = [
  { label: "Codebase Architecture", value: "architecture" },
  { label: "Reviews", value: "reviews" },
  { label: "General", value: "general" },
  { label: "Templates", value: "templates" },
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
    Sentry.logger.info(
      Sentry.logger.fmt`Repository tab changed to ${value}`,
      {
        repository,
        new_tab: value,
        prev_tab: currentTab,
        timestamp: new Date().toISOString(),
      }
    );
    router.push(`/repositories/${repository}/${value}`);
  };

  return (
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
      <div className="mt-4 h-[92.5%]">{children}</div>
    </div>
  );
}
