"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import PrivatePageGuard from "@/components/private-page-guard"

const tabs = [
  { label: "Billing", href: "/account/billing" },
  { label: "Members", href: "/account/members" },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <PrivatePageGuard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-2">
          <h1 className="text-2xl font-semibold text-foreground">Account</h1>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === tab.href
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div>{children}</div>
      </div>
    </PrivatePageGuard>
  )
}
