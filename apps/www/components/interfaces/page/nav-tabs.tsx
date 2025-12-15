"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@thinkthroo/ui/components/components/scroll-area";

const architecture = [
  {
    name: "Tooling",
    href: "#tooling",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/mail",
  },
  {
    name: "Project Structure",
    href: "#project-structure",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/mail",
  },
  {
    name: "Components Structure",
    href: "#components-structure",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/mail",
  },
  {
    name: "API Layer",
    href: "#api-layer",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/dashboard",
  },
  {
    name: "State Management",
    href: "#state-management",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/cards",
  },
  {
    name: "Error Handling",
    href: "#error-handling",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/tasks",
  },
  {
    name: "Testing",
    href: "#testing",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/playground",
  },
  {
    name: "Performance",
    href: "#performance",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/forms",
  },
  {
    name: "Security",
    href: "#security",
    code: "https://github.com/shadcn/ui/tree/main/apps/www/app/(app)/architecture/music",
  },
];

interface NavTabsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function NavTabs({ className, ...props }: NavTabsProps) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center", className)} {...props}>
          {architecture.map((example, index) => (
            <Link
              href={example.href}
              key={example.href}
              className={cn(
                "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                pathname?.startsWith(example.href) ||
                  (index === 0 && pathname === "/architecture")
                  ? "bg-muted font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              {example.name}
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}

interface NavTabLinkProps {
  pathname: string | null;
}

export function NavTabLink({ pathname }: NavTabLinkProps) {
  const example = architecture.find((example) =>
    pathname?.startsWith(example.href)
  );

  if (!example?.code) {
    return null;
  }

  return (
    <Link
      href={example?.code}
      target="_blank"
      rel="nofollow"
      className="absolute right-0 top-0 hidden items-center rounded-[0.5rem] text-sm font-medium md:flex"
    >
      View code
      <ArrowRightIcon className="ml-1 h-4 w-4" />
    </Link>
  );
}
