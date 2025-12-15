// 'use client'

import Image from "next/image";
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
import { Button } from "@thinkthroo/ui/components/components/button";
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
} from "@thinkthroo/ui/components/components/select";
import { NavTabs } from "@/components/interfaces/page/nav-tabs";
import { Icons } from "@/components/icons";
import { getArchitectureCourses } from "@/lib/data/get-architecture-courses";
import { Separator } from "@thinkthroo/ui/components/components/separator";
// import { useState } from "react";
import { client } from "@thinkthroo/lesson/utils/sanity-client";
import { Lock } from "lucide-react";
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

export default async function BestPracticesPage() {

  const bestPracticesCourses = await getModules("Best Practices", "bestPractices");

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Best Practices</PageHeaderHeading>
        <PageHeaderDescription>
          Learn feature implementation patterns, inspired by open source projects.
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
            courses={bestPracticesCourses} 
            module="best-practices"  
          />
        </div>
        <Separator />
      </div>
    </div>
  );
}
