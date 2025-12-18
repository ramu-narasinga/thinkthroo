"use client"

import { Building2, ChevronsUpDown, Plus, RefreshCw } from "lucide-react"
import { useOrganizations } from "@/hooks/useOrganizations"
import { useUmamiTracking } from "@/hooks/useUmamiTracking"
import Image from "next/image"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@thinkthroo/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@thinkthroo/ui/components/sidebar"

export function OrgSwitcher() {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_OAUTH_APP_CLIENT
  const baseUrl = process.env.NEXT_PUBLIC_GITHUB_OAUTH_APP_BASE_SETTINGS_URL
  const settingsUrl = `${baseUrl}/${clientId}`

  const { isMobile } = useSidebar()
  const { trackEvent } = useUmamiTracking()
  
  const {
    organizations,
    activeOrg,
    isSyncing,
    setActiveOrg,
    syncFromGitHub,
  } = useOrganizations()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg">
                <Building2 />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrg?.login || activeOrg?.githubOrgId || 'Select Organization'}
                </span>
                <span className="truncate text-xs">Change Organization</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs flex items-center justify-between">
              Organizations
              <button
                onClick={() => {
                  syncFromGitHub()
                  trackEvent("org_sync_clicked", {
                    device: isMobile ? "mobile" : "desktop",
                  })
                }}
                disabled={isSyncing}
                className="ml-2 text-xs flex items-center gap-1 hover:opacity-80 disabled:opacity-50"
              >
                <RefreshCw className={`size-3 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing" : "Sync"}
              </button>
            </DropdownMenuLabel>

            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  setActiveOrg(org.id)
                  trackEvent("org_switched", {
                    org_name: org.login || org.githubOrgId,
                    device: isMobile ? "mobile" : "desktop",
                  })
                }}
                className="gap-2 p-2"
              >
                <div className="flex items-center gap-2">
                  {org.avatarUrl && (
                    <Image
                      src={org.avatarUrl}
                      alt={org.login || org.githubOrgId}
                      width={24}
                      height={24}
                      className="rounded"
                    />
                  )}
                  <span>{org.login || org.githubOrgId}</span>
                </div>
              </DropdownMenuItem>
            ))}

            {organizations.length === 0 && (
              <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                No organizations found. Click Sync to load.
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => window.open(settingsUrl, "_blank")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
