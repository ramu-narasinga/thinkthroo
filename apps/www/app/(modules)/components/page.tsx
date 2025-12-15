import { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/interfaces/page/header";
import { Button } from "@thinkthroo/ui/components/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@thinkthroo/ui/components/components/card";
import { siteConfig } from "@/lib/config";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>
            Beautiful UI components.
        </PageHeaderHeading>
        <PageHeaderDescription>
          Copy and paste these reusable components into your project.
        </PageHeaderDescription>
      </PageHeader>
      <div className="grid gap-4">
        <div className="gap-6 md:flex md:flex-row-reverse md:items-start">
          <div className="grid flex-1 gap-12">
            <h2 className="sr-only">Examples</h2>
            <div
              id="examples"
              className="grid flex-1 scroll-mt-20 items-start gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10"
            >
              <Link href={"/components/hero"}>
                <div
                  className={
                    "themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer hover:shadow transition-all duration-200 ease-in-out hover:z-30"
                  }
                >
                  <div className="relative z-10 [&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none">
                    <Card>
                      <CardHeader>
                        <CardTitle>Hero sections</CardTitle>
                        <CardDescription>4 components</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Image
                              src={"/heroes.png"}
                              alt="Component"
                              width={500}
                              height={500}
                          />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Link>
              <div
                className={
                  "themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer hover:shadow transition-all duration-200 ease-in-out hover:z-30"
                }
              >
                <div className="relative z-10 [&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none">
                  <Card>
                    <CardHeader>
                      <CardTitle>Feature sections</CardTitle>
                      <CardDescription>4 components</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Image
                            src={"/heroes.png"}
                            alt="Component"
                            width={500}
                            height={500}
                        />
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div
                className={
                  "themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer hover:shadow transition-all duration-200 ease-in-out hover:z-30"
                }
              >
                <div className="relative z-10 [&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none">
                  <Card>
                    <CardHeader>
                      <CardTitle>CTA sections</CardTitle>
                      <CardDescription>4 components</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Image
                            src={"/heroes.png"}
                            alt="Component"
                            width={500}
                            height={500}
                        />
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div
                className={
                  "themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border cursor-pointer hover:shadow transition-all duration-200 ease-in-out hover:z-30"
                }
              >
                <div className="relative z-10 [&>div]:rounded-none [&>div]:border-none [&>div]:shadow-none">
                  <Card>
                    <CardHeader>
                      <CardTitle>Header sections</CardTitle>
                      <CardDescription>4 components</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Image
                            src={"/heroes.png"}
                            alt="Component"
                            width={500}
                            height={500}
                        />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
