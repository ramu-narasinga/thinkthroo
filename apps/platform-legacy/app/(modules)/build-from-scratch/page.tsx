import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { NavTabs } from "@/components/interfaces/page/nav-tabs";
import { Separator } from "@thinkthroo/ui/components/components/separator";
import { Module } from "@/components/interfaces/modules/module";
import { getModules } from "@/lib/modules";

type Tag = {
  title: string;
}

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
  tags: Tag[];
};

export default async function BuildFromScratchPage() {
  const buildFromScratchCourses = await getModules("Build From Scratch", "buildFromScratch");

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Build From Scratch</PageHeaderHeading>
        <PageHeaderDescription>
          Build tools like Shadcn CLI from scratch. 
        </PageHeaderDescription>
        {/* <PageActions>
          
        </PageActions> */}
      </PageHeader>

      <div className="grid flex-1 gap-12">
        <div 
          id="open-source-projects"
          className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 lg:grid-cols-3">
          <Module 
            courses={buildFromScratchCourses} 
            module="build-from-scratch"
          />
        </div>
        <Separator />
      </div>
    </div>
  );
}
