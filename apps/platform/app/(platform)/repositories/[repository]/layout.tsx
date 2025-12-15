"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@thinkthroo/ui/components/button";
import { Switch } from "@thinkthroo/ui/components/switch";
import { Label } from "@thinkthroo/ui/components/label";

const tabs = [
  { label: "Codebase Architecture", path: "architecture" },
  { label: "Reviews", path: "reviews" },
  { label: "General", path: "general" },
];

export default function RepositoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const repository = params.repository as string;
  const [useOrgSettings, setUseOrgSettings] = useState(false);

  // Get the current tab from the path
  const currentTab = pathname.split("/").pop();

  return (
    <div className="px-6 space-y-2">
      {/* Header with repository name and Apply Changes button */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-semibold lowercase">{repository}</h1>
          <div className="flex flex-col items-end space-y-3">
            <Button className="bg-black hover:bg-gray-500 text-white">
              Apply Changes
            </Button>
          </div>
        </div>

        {/* Organization Settings Toggle */}
        <div className="pt-4">
          <div className="flex justify-between items-start">
            <div>
              <Label className="text-base font-medium text-xl">
                Use Organization Settings
              </Label>
              <p className="text-md font-regular text-muted-foreground max-w-xl mt-1 whitespace-nowrap">
                Organization settings will be applied. If disabled, the
                repository-specific settings configured below will be used.
              </p>
            </div>
            <Switch
              checked={useOrgSettings}
              onCheckedChange={setUseOrgSettings}
              className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation and Content - only shown when not using org settings */}
      {!useOrgSettings && (
        <>
          {/* Tab Navigation */}
          <div className="flex items-center space-x-8 border-b mb-4">
            <nav className="flex space-x-4">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={`/repositories/${repository}/${tab.path}`}
                  >
                    <button
                      className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        isActive
                          ? "border-black text-black"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {tab.label}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-4">{children}</div>
        </>
      )}
    </div>
  );
}
