import { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/interfaces/page/header";
import { Button } from "@thinkthroo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@thinkthroo/ui/components/card";
import { siteConfig } from "@/lib/config";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>
            Open Source Projects.
        </PageHeaderHeading>
        <PageHeaderDescription>
          
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid gap-4">
        <div className="gap-6 md:flex md:flex-row-reverse md:items-start">
          <div className="grid flex-1 gap-12">
            <h2 className="sr-only">OSS Projects</h2>
            <div
              id="oss"
              className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10"
            >
              <Link href={"https://github.com/ramu-narasinga/thinkthroo-cli"} target="_blank">
                <div
                  className={
                    "themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer hover:shadow transition-all duration-200 ease-in-out hover:z-30"
                  }
                >
                  <div className="relative z-10 [&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none">
                    <Card>
                      <CardHeader>
                        <CardTitle>@thinkthroo/cli</CardTitle>
                        <CardDescription>CLI tool to add feature specific code into your Next.js project</CardDescription>
                      </CardHeader>
                      <CardContent>
                          WIP.
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Link>
            </div>
            <div
              id="oss"
              className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10"
            >
              <Link href={"https://github.com/ramu-narasinga/animate-code"} target="_blank">
                <div
                  className={
                    "themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer hover:shadow transition-all duration-200 ease-in-out hover:z-30"
                  }
                >
                  <div className="relative z-10 [&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none">
                    <Card>
                      <CardHeader>
                        <CardTitle>Animate Code</CardTitle>
                        <CardDescription>Generate code animations based on markdown. Built with Remotion + CodeHike</CardDescription>
                      </CardHeader>
                      <CardContent>
                          
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
