import { Icons } from "@/components/icons"
import { SidebarNavItem } from "@/types/nav"

// Codebase architecture
// [CA]: Shadcn
import { shadcnCaBaseUrl, shadcnCaNav } from "./codebase-architecture/shadcn-ui";

// Best practices
// [BP]:[CRM]:[Contacts Page]:[Components Structure]
import { baseUrl as crmContactsPageCsShadcnBaseUrl, crmContactsPageComponentsStructureByShadcnNav } from "./best-practices/crm-contacts-page/components-structure/shadcn"
import { baseUrl as crmContactsPageCsSupabaseBaseUrl, crmContactsPageComponentsStructureBySupabaseNav } from "./best-practices/crm-contacts-page/components-structure/supabase"
import { supabaseCaBaseUrl, supabaseCaNav } from "./codebase-architecture/supabase";
import { calcomCaBaseUrl, calcomCaNav } from "./codebase-architecture/cal-com";
import { lobechatCaBaseUrl, lobechatCaNav } from "./codebase-architecture/lobechat";

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
    },
    {
      title: "CLI",
      href: "/cli",
    },
    {
      title: "Challenges",
      href: "/challenges",
    }
  ],
  // TODO: do we still need this sidebarNav?
  sidebarNav: [
    {
      title: "Components Structure In Shadcn-ui/ui",
      href: `/guide/codebase-architecture/components-structure/shadcn-ui`,
      items: [
        {
          title: "Introduction",
          href: `/guide/codebase-architecture/components-structure/shadcn-ui/introduction`,
          items: [],
        },
        {
          title: "Home Page",
          href: `/guide/codebase-architecture/components-structure/shadcn-ui/home-page`,
          items: [],
        },
        {
          title: "Mail Example Page",
          href: `/guide/codebase-architecture/components-structure/shadcn-ui/mail-example-page`,
          items: [],
        },
        {
          title: "Charts Page",
          href: `/guide/codebase-architecture/components-structure/shadcn-ui/charts-page`,
          items: [],
        },
      ],
    },
  ]  
}

let sidebarNav = new Map();

// Codebase architecture

// CA: Shadcn/ui codebase architecture
sidebarNav.set(shadcnCaBaseUrl, shadcnCaNav);

// CA: Supabase codebase architecture
sidebarNav.set(supabaseCaBaseUrl, supabaseCaNav);

// CA: Cal.com codebase architecture
sidebarNav.set(calcomCaBaseUrl, calcomCaNav);

// CA: Lobechat codebase architecture
sidebarNav.set(lobechatCaBaseUrl, lobechatCaNav);

// Best practices

// [BP]:[CRM]:[Contacts Page]:[Components Structure]
sidebarNav.set(crmContactsPageCsShadcnBaseUrl, crmContactsPageComponentsStructureByShadcnNav);
sidebarNav.set(crmContactsPageCsSupabaseBaseUrl, crmContactsPageComponentsStructureBySupabaseNav);


export function getSidenavConfig(pathname: String): SidebarNavItem[] {
  // example pathname: "/guide/codebase-architecture/shadcn-ui/components-structure/introduction";
  // after split, join and slice, output: /guide/codebase-architecture/shadcn-ui
  // output is the key in sidebarNav map.
  return sidebarNav.get(pathname.split('/').slice(0, 4).join('/'));

}