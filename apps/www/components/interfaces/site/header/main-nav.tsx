"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { MENU } from "./constant";
import { Button } from "@thinkthroo/ui/components/components/button";

export function MainNav({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className={cn("items-center", className)} {...props}>
            {MENU.map((item) => (
              <Button key={item.href} variant="ghost" asChild size="sm">
                <Link
                  href={item.href}
                  className={cn(pathname === item.href && "text-primary")}
                >
                  {item.name}
                </Link>
              </Button>
            ))}
      </nav>
    </div>
  );
}
