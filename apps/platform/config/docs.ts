import { Icons } from "@/components/icons"
import { SidebarNavItem } from "@/types/nav"
import { baseUrl as shadcnComponentsStructureBaseUrl, shadcnComponentsStructureNav } from "./codebase-architecture/components-structure/shadcn-ui"
import { baseUrl as lobechatApiLayerBaseUrl, lobechatApiLayerNav } from "./codebase-architecture/api-layer/lobechat"
import { baseUrl as calcomErrorHandlingBaseUrl, calcomErrorHandlingNav } from "./codebase-architecture/error-handling/cal-com"
import { baseUrl as supabaseSecurityBaseUrl, supabaseSecurityNav } from "./codebase-architecture/security/supabase"
import { baseUrl as shadcnToolingBaseUrl, shadcnToolingNav } from "./codebase-architecture/tooling/shadcn-ui"
import { baseUrl as calcomApiLayerBaseUrl, calcomApiLayerNav } from "./codebase-architecture/api-layer/calcom"
import { baseUrl as shadcnProjectStructureBaseUrl, shadcnProjectStructureNav } from "./codebase-architecture/project-structure/shadcn"
import { baseUrl as supabaseProjectStructureBaseUrl, supabaseProjectStructureNav } from "./codebase-architecture/project-structure/supabase"
import { baseUrl as lobechatStateManagementUrl, lobechatStateManagementNav } from "./codebase-architecture/state-management/lobechat"
import { baseUrl as supabaseToolingBaseUrl, supabaseToolingNav } from "./codebase-architecture/tooling/supabase"

export interface NavItem {
    title: string
    href?: string
    disabled?: boolean
    external?: boolean
    icon?: keyof typeof Icons
    label?: string
}

export interface MainNavItem extends NavItem {}

export interface DocsConfig {
  mainNav: MainNavItem[],
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Architecture",
      href: "/architecture",
    },
    {
      title: "Best Practices",
      href: "/best-practices",
    },
    {
      title: "Production Grade Projects",
      href: "/production-grade-projects",
    },
    {
      title: "Build From Scratch",
      href: "/build-from-scratch",
    }
  ],
  sidebarNav: [
    {
      title: "Components Structure In Shadcn-ui/ui",
      href: `/course/codebase-architecture/components-structure/shadcn-ui`,
      items: [
        {
          title: "Introduction",
          href: `/course/codebase-architecture/components-structure/shadcn-ui/introduction`,
          items: [],
        },
        {
          title: "Home Page",
          href: `/course/codebase-architecture/components-structure/shadcn-ui/home-page`,
          items: [],
        },
        {
          title: "Mail Example Page",
          href: `/course/codebase-architecture/components-structure/shadcn-ui/mail-example-page`,
          items: [],
        },
        {
          title: "Charts Page",
          href: `/course/codebase-architecture/components-structure/shadcn-ui/charts-page`,
          items: [],
        },
      ],
    },
  ]  
}

let sidebarNav = new Map();

// Codebase architecture

// [CA]:[API Layer]
sidebarNav.set(lobechatApiLayerBaseUrl, lobechatApiLayerNav)
sidebarNav.set(calcomApiLayerBaseUrl, calcomApiLayerNav)

// [CA]:[Components Structure]
sidebarNav.set(shadcnComponentsStructureBaseUrl, shadcnComponentsStructureNav)

// [CA]:[Error Handling]
sidebarNav.set(calcomErrorHandlingBaseUrl, calcomErrorHandlingNav)

// [CA]:[Project Structure]
sidebarNav.set(shadcnProjectStructureBaseUrl, shadcnProjectStructureNav)
sidebarNav.set(supabaseProjectStructureBaseUrl, supabaseProjectStructureNav)

// [CA]:[Security]
sidebarNav.set(supabaseSecurityBaseUrl, supabaseSecurityNav)

// [CA]:[State Management]
sidebarNav.set(lobechatStateManagementUrl, lobechatStateManagementNav)

// [CA]:[Tooling]
sidebarNav.set(shadcnToolingBaseUrl, shadcnToolingNav)
sidebarNav.set(supabaseToolingBaseUrl, supabaseToolingNav)

// Best practices

export function getSidenavConfig(pathname: String): SidebarNavItem[] {
  // This slice is required since the key is base url to dynamically fetch sidebar nav items
  // based on course selected and found using baseUrl instead of introUrl safe as baseUrl
  // is common in a couse
  // Example: "/course/codebase-architecture/components-structure/shadcn-ui/charts-page" becomes
  // "/course/codebase-architecture/components-structure/shadcn-ui" which is a baseUrl and is the key.
  return sidebarNav.get(pathname.slice(0, pathname.lastIndexOf("/")))
}