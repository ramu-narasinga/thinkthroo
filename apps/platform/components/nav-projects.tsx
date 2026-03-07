"use client"

import {
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@thinkthroo/ui/components/sidebar"
import { usePathname } from "next/navigation"
import { useUmamiTracking } from "@/hooks/useUmamiTracking"

export function NavProjects({
  projects,
  label
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[],
  label: string
}) {
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const { trackEvent } = useUmamiTracking()

  const handleNavClick = (itemName: string, url: string) => {
    trackEvent("sidebar_navigation", {
      item: itemName,
      url: url,
      section: label,
      device: isMobile ? "mobile" : "desktop",
    })
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild isActive={pathname === item.url}>
              <Link href={item.url} onClick={() => handleNavClick(item.name, item.url)}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
