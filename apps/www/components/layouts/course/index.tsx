import { docsConfig } from "@/config/docs"
import { DocsSidebarNav } from "@/components/interfaces/course/side-nav"
import { ScrollArea } from "@thinkthroo/ui/components/scroll-area"


export interface CommonCourseLayoutProps {
  children: React.ReactNode
}

export default function CommonCourseLayout({ children }: CommonCourseLayoutProps) {
  return (
    <div className="border-b">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <DocsSidebarNav config={docsConfig} />
          </ScrollArea>
        </aside>
        {children}
      </div>
    </div>
  )
}