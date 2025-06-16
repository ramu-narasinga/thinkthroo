import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { NavTabs } from "@/components/interfaces/page/nav-tabs";
import { Separator } from "@thinkthroo/ui/components/separator";
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

export default async function ArchitecturePage() {
  const architectureCourses = await getModules("Codebase Architecture", "codebaseArchitecture");

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Codebase Architecture</PageHeaderHeading>
        <PageHeaderDescription>
          Learn the architectural concepts, build your confidence and 10x your coding skills.
        </PageHeaderDescription>
        {/* <PageActions>
          
        </PageActions> */}
      </PageHeader>

      <NavTabs className="[&>a:first-child]:text-primary" />

      <div className="grid flex-1 gap-12">
        <div 
          id="open-source-projects"
          className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 lg:grid-cols-3">
          <Module 
            courses={architectureCourses} 
            module="codebase-architecture"
          />
        </div>
        <Separator />
      </div>
    </div>
  );
}
