"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
// import { SidebarNavItem } from "@/types/nav"
// import { getSidenavConfig, type DocsConfig } from "@/config/docs"
import { cn } from "@/lib/utils"

type Lesson = {
  title: string,
  slug: string,
  order: number,
}

type Chapter = {
  title: string,
  lessons: Lesson[],
}
export interface DocsSidebarNavProps {
  chapters: Chapter[]
}

export function DocsSidebarNav({ chapters }: DocsSidebarNavProps) {

  return chapters.length ? (
    <div className="w-full">
      {chapters.map((chapter, index) => (
        <div key={index} className={cn("pb-4")}>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
            {chapter.title}
          </h4>
          {chapter?.lessons?.length && (
            <DocsSidebarNavItems lessons={chapter?.lessons} />
          )}
        </div>
      ))}
    </div>
  ) : null
}

interface DocsSidebarNavItemsProps {
  lessons: Lesson[]
}

export function DocsSidebarNavItems({
  lessons,
}: DocsSidebarNavItemsProps) {
  
  const pathname = usePathname()

  return lessons?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {lessons.map((lesson, index) =>
          <Link
            key={index}
            href={lesson.slug}
            className={cn(
              "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline",
              // item.disabled && "cursor-not-allowed opacity-60",
              pathname === lesson.slug
                ? "font-medium text-foreground"
                : "text-muted-foreground"
            )}
            target={""}
            rel={""}
          >
            {lesson.title}
            {/* {item.label && (
              <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                {item.label}
              </span>
            )} */}
          </Link>
      )
      //   : (
      //     <span
      //       key={index}
      //       className={cn(
      //         "flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline",
      //         item.disabled && "cursor-not-allowed opacity-60"
      //       )}
      //     >
      //       {item.title}
      //       {item.label && (
      //         <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
      //           {item.label}
      //         </span>
      //       )}
      //     </span>
      //   )
      // )
      }
    </div>
  ) : null
}