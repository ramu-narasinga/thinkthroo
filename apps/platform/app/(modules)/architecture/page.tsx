'use client'

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
import { getArchitectureCourses } from "@/lib/data/get-architecture-courses";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

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

export default function ArchitecturePage() {
  const architectureCourses = getArchitectureCourses();
  const [selectedFramework, setSelectedFramework] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");

  const handleFrameworkChange = (value: string) => {
    setSelectedFramework(value);
  };

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
  };

  // Filter the courses based on selected dropdown values
  const filterCourses = (courseList: any[]) => {
    return courseList.filter((course) => {
      const frameworkMatches =
        selectedFramework === "All" || course.tags.includes(selectedFramework.toLowerCase());

      const projectMatches =
        selectedProject === "All" || course.tags.includes(selectedProject.toLowerCase());

      return frameworkMatches && projectMatches;
    });
  };

  const Item: React.FC<{ courses: any[] }> = ({ courses }) => {
    return (
      <>
        {courses.map((course, index: number) => (
          <Link key={index} href={course.slug}>
            <div className="relative flex flex-col overflow-hidden rounded-xl border shadow transition-all duration-200 ease-in-out hover:z-30">
              <div className="items-center gap-2 relative z-20 flex justify-end border-b bg-card px-3 py-2.5 text-card-foreground">
                <div className="flex items-center gap-1.5 pl-1 text-[13px] text-muted-foreground">
                  {course.concept.label}
                </div>
                <div className="ml-auto flex items-center gap-2 [&amp;>form]:flex">
                  <button className="inline-flex items-center justify-center h-6 rounded-[6px] border bg-transparent px-2 text-xs">
                    {course.chapters} Chapters
                  </button>
                  <button className="inline-flex items-center justify-center h-6 rounded-[6px] border bg-transparent px-2 text-xs">
                    {course.lessons} Lessons
                  </button>
                  <button className="inline-flex items-center justify-center h-6 rounded-[6px] border bg-transparent px-2 text-xs">
                    Read
                  </button>
                </div>
              </div>

              <div className="relative z-10 bg-card text-card-foreground shadow">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="font-semibold leading-none tracking-tight">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>
                <div className="p-6 pt-0">
                  <div className="grid grid-cols-3 gap-2">
                    {course.tags.map((tag: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Icons.tag />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </>
    );
  };

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
          <Item courses={architectureCourses} />
        </div>
        <Separator />
      </div>
    </div>
  );
}
