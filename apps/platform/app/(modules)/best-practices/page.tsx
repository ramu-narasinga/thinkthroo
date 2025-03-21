import Image from "next/image";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavTabs } from "@/components/interfaces/page/nav-tabs";
import { Icons } from "@/components/icons";
import { getBestPracticesCourses } from "@/lib/data/get-best-practices-course";
import { Separator } from "@/components/ui/separator";

type Course = {
  title: string;
  description: string;
  slug: string;
  chapters: number;
  lessons: number;
  concept: {
    label: string;
    slug: string;
  };
  tags: string[];
};

type ItemProps = {
  courses: Course[];
};

export default function BestPracticesPage() {

  const bestPracticesCourses = getBestPracticesCourses()

  const getKeys = () => {
    return Object.keys(bestPracticesCourses) as Array<keyof typeof bestPracticesCourses>
  }

  const Item: React.FC<ItemProps> = (props) => {
    return (
      <>
        {
          props?.courses.map((course, index: number) => 
            <Link key={index} href={course.slug}>
            <div className="relative flex flex-col overflow-hidden rounded-xl border shadow transition-all duration-200 ease-in-out hover:z-30">
                <div className="items-center gap-2 relative z-20 flex justify-end border-b bg-card px-3 py-2.5 text-card-foreground">
                  <div className="flex items-center gap-1.5 pl-1 text-[13px] text-muted-foreground">
                    {course.concept.label}
                  </div>
                  <div className="ml-auto flex items-center gap-2 [&amp;>form]:flex">
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input hover:text-accent-foreground h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground"
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      aria-controls="radix-:rhu:"
                      data-state="closed"
                    >
                      {course.chapters} Chapters
                    </button>
                    <div data-orientation="vertical" role="none" className="shrink-0 bg-border w-[1px] mx-0 hidden h-4 md:flex"></div>
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input hover:text-accent-foreground h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground"
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      aria-controls="radix-:rhu:"
                      data-state="closed"
                    >
                      {course.lessons} Lessons
                    </button>
                    <div data-orientation="vertical" role="none" className="shrink-0 bg-border w-[1px] mx-0 hidden h-4 md:flex"></div>
                    
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input hover:text-accent-foreground h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground"
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      aria-controls="radix-:rhu:"
                      data-state="closed"
                    >
                      Read
                    </button>
                  </div>
                </div>
                
                  <div className="relative z-10 [&amp;>div]:rounded-none [&amp;>div]:border-none [&amp;>div]:shadow-none">
                    <div className="bg-card text-card-foreground shadow">
                      <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {course.description}
                        </p>
                      </div>
                      <div className="p-6 pt-0">
                        <div className="grid grid-cols-3 gap-2">
                          {
                            course.tags.map((tag, index: number) => <div key={index} className="flex items-center">
                                <Icons.tag />
                                {tag}
                              </div>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
              </Link>
          )
        }
      </>
    )
  }

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Best Practices</PageHeaderHeading>
        <PageHeaderDescription>
          An analysis of best practices found in Open Source projects is provided in the below courses.
          
        </PageHeaderDescription>
        <PageActions>
          {/* <Select defaultValue="Next.js">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Next.js">Next.js</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select> */}
        </PageActions>
      </PageHeader>

      <div className="grid flex-1 gap-12">
        <div 
          className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10">
          <Item 
            courses={bestPracticesCourses}
          />
        </div>
      </div>

      {/* <div className="grid flex-1 gap-12">
        <div className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10">
          
        {
            bestPracticesCourses.map((course,index) => <div key={index} className="relative flex flex-col overflow-hidden rounded-xl border shadow transition-all duration-200 ease-in-out hover:z-30">
              <div className="items-center gap-2 relative z-20 flex justify-end border-b bg-card px-3 py-2.5 text-card-foreground">
                <div className="flex items-center gap-1.5 pl-1 text-[13px] text-muted-foreground">
                  {course.concept.label}
                </div>
                <div className="ml-auto flex items-center gap-2 [&amp;>form]:flex">
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input hover:text-accent-foreground h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rhu:"
                    data-state="closed"
                  >
                    {course.chapters} Chapters
                  </button>
                  <div data-orientation="vertical" role="none" className="shrink-0 bg-border w-[1px] mx-0 hidden h-4 md:flex"></div>
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input hover:text-accent-foreground h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="radix-:rhu:"
                    data-state="closed"
                  >
                    {course.lessons} Lessons
                  </button>
                  <div data-orientation="vertical" role="none" className="shrink-0 bg-border w-[1px] mx-0 hidden h-4 md:flex"></div>
                  <Link
                    href={course.slug}
                  >
                    <button
                      className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input hover:text-accent-foreground h-6 rounded-[6px] border bg-transparent px-2 text-xs text-foreground shadow-none hover:bg-muted dark:text-foreground"
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded="false"
                      aria-controls="radix-:rhu:"
                      data-state="closed"
                    >
                      Read
                    </button>
                  </Link>
                </div>
              </div>
              <div className="relative z-10 [&amp;>div]:rounded-none [&amp;>div]:border-none [&amp;>div]:shadow-none">
                <div className="bg-card text-card-foreground shadow">
                  <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="font-semibold leading-none tracking-tight">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                      {
                        course.tags.map((tag, index) => <div key={index} className="flex items-center">
                            <Icons.tag />
                            {tag}
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          }

        </div>
      </div> */}
    </div>
  );
}
