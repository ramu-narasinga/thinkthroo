"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@thinkthroo/ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs";

const tabs = [
  { label: "Codebase Architecture", value: "architecture" },
  { label: "Reviews", value: "reviews" },
  { label: "General", value: "general" },
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
    <div className="px-6 space-y-2">
      {/* Header with repository name and Apply Changes button */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-semibold lowercase">{repository}</h1>
        </div>
      </div>

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
  );
}
