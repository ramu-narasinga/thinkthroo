"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@thinkthroo/ui/components/navigation-menu";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/components"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/architecture")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Components
        </Link>
        <Link
          href="https://app.thinkthroo.com/architecture"
          target="_blank"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/architecture")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Codebase Architecture
        </Link>
        <Link
          href="/open-source"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/open-source")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Open Source
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  "transition-colors hover:text-foreground/80 text-foreground/60 font-normal bg-transparent"
                )}
              >
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent className="px-4 py-2 ">
                <Link href="https://github.com/ramu-narasinga/animate-code" target="_blank">
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                  >
                    Animate Code
                  </NavigationMenuLink>
                </Link>
                
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Link
          href="/blog"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/production-grade-projects")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Blog
        </Link>
        <Link
          href="/consultation"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/consultation")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Contact
        </Link>
      </nav>
    </div>
  );
}
