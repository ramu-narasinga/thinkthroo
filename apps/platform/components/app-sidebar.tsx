"use client"

import * as React from "react"
import {
  BookMarked,
  Bot,
  DollarSign,
  LayoutDashboard,
  LifeBuoy,
  PieChart,
  SquareTerminal,
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@thinkthroo/ui/components/sidebar"
import { SidebarOptInForm } from "./tokens-usage";
import { OrgSwitcher } from "./org-switcher";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc.",
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "CodeArc",
      url: "/codearc",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard
        },
        {
          title: "Repositories",
          url: "/repositories",
          icon: BookMarked
        },
        {
          title: "Subscription",
          url: "/subscription",
          icon: DollarSign
        },
      ],
    },
    {
      title: "Learn",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Codebase Architecture",
          url: "#",
          icon: BookMarked
        },
        {
          title: "Production Grade Projects",
          url: "#",
          icon: BookMarked
        },
        {
          title: "Challenges",
          url: "#",
          icon: BookMarked
        },
        {
          title: "Leaderboard",
          url: "#",
          icon: BookMarked
        },
      ],
    },
  ],
  navSecondary: [],
  codearc: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Repositories",
      url: "/repositories",
      icon: BookMarked,
    },
    {
      name: "Subscription",
      url: "/subscription",
      icon: DollarSign,
    },
  ],
  learn: [
    {
      name: "Codebase Architecture",
      url: "/architecture",
      icon: LayoutDashboard,
    },
    {
      name: "Production Grade Projects",
      url: "/production-grade-projects",
      icon: BookMarked,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          {/* <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="CodeArc Logo"
                    width={35}
                    height={35}
                    className="object-contain"
                  />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
          <SidebarMenuItem>
            <OrgSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={data.codearc} label="CodeArc" />
        <NavProjects projects={data.learn} label="Learn" />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarOptInForm />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
