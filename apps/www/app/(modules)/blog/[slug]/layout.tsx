import { docsConfig } from "@/config/docs"
import { DocsSidebarNav } from "@/components/interfaces/course/side-nav"
import { ScrollArea } from "@thinkthroo/ui/components/components/scroll-area"
import { fetchGroupedPostsForSidebar } from "@/lib/articles"

export interface CommonCourseLayoutProps {
  children: React.ReactNode
}

export default async function CommonCourseLayout({ children }: CommonCourseLayoutProps) {

  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      {children}
    </div>
  )
}