"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { MENU } from "./constant";
import { Button } from "@thinkthroo/ui/components/button";
import { useUmami } from "@/hooks/use-umami";

export function MainNav({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  const pathname = usePathname();
  const { track } = useUmami();

  const handleMenuClick = (itemName: string, itemHref: string) => {
    track('navigation-click', {
      menu_item: itemName,
      href: itemHref
    });
  };

  return (
    <div className="mr-4 hidden md:flex">
      <Link 
        href="/" 
        className="mr-4 flex items-center space-x-2 lg:mr-6"
        onClick={() => track('navigation-click', { menu_item: 'logo', href: '/' })}
      >
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
                  onClick={() => handleMenuClick(item.name, item.href)}
                >
                  {item.name}
                </Link>
              </Button>
            ))}
      </nav>
    </div>
  );
}
