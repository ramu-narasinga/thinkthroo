"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@thinkthroo/ui/components/components/scroll-area";

const architectureSections = [
  {
    name: "Open Source Projects",
    href: "/architecture"
  },
  {
    name: "Templates",
    href: "/architecture/templates"
  }
];

const templateTabs = [
  "Tooling",
  "Project structure",
  "Components structure",
  "API layer",
  "State management",
  "Testing",
  "Error handling",
  "Security",
  "Performance",
  "Deployment"
]

interface NavTabsProps extends React.HTMLAttributes<HTMLDivElement> { }

export function NavTabs({ className, ...props }: NavTabsProps) {
  const pathname = usePathname();
  const isTemplatesPage = pathname === "/architecture/templates";

  const [selectedTab, setSelectedTab] = useState("Tooling");

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div
          className={cn(
            "mb-4 flex items-center border-b border-transparent",
            className
          )}
          {...props}
        >
          {architectureSections.map((section) => (
            <Link
              href={section.href}
              key={section.href}
              className={cn(
                "relative flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                pathname === section.href
                  ? "bg-muted font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              {section.name}
            </Link>
          ))}
        </div>

        {/* Line below tabs only on Templates page */}
        {isTemplatesPage && (
          <div className="h-[1px] bg-gray-300 w-full mb-2 ml-2" />
        )}

        {/* Toggle buttons below the line */}
        {isTemplatesPage && (
          <div className="mt-1 ml-1 flex gap-1 mb-2 rounded-md bg-muted p-1 w-fit">
            {
              templateTabs.map(tab => <button
                onClick={() => setSelectedTab(tab)}
                className={cn(
                  "px-3 py-1 text-sm rounded-md",
                  selectedTab === tab
                    ? "bg-white text-black shadow"
                    : "text-muted-foreground"
                )}
              >
                {tab}
              </button>
              )}
          </div>
        )}

        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
