"use client";

import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/interfaces/page/header";
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
import HeroOne from "./components/hero/hero-one";
import posthog from "posthog-js";

export default function Page() {
  const handleCTAClick = (buttonType: string) => {
    posthog.capture("components_get_started_clicked", {
      button_type: buttonType,
      page: "components"
    });
  };

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>
          Beautiful UI components, crafted with Shadcn/ui.
        </PageHeaderHeading>
        <PageHeaderDescription>
          Copy and paste these reusable components into your project.
        </PageHeaderDescription>
      </PageHeader>
      <div className="relative -mt-[65px]">
        <div className="sm:py-18 container relative mx-auto px-6 py-16 md:py-24 lg:px-16 lg:py-24 xl:px-20 pt-8 pb-10 md:pt-16 overflow-hidden">
          <div className="relative">
            <div className="mx-auto">
              <div className="mx-auto max-w-2xl lg:col-span-6 lg:flex lg:items-center justify-center text-center">
                <div className="relative z-10 lg:h-auto pt-[90px] lg:pt-[90px] lg:min-h-[300px] flex flex-col items-center justify-center sm:mx-auto md:w-3/4 lg:mx-0 lg:w-full gap-4 lg:gap-8">
                  <div className="flex flex-col items-center">
                    <a
                      className="group flex items-center flex-wrap text-sm transition-opacity mb-4 lg:mb-8 -mt-4"
                      href="/events/scale-to-millions-goodtape-auth"
                    >
                      <span className="py-1 uppercase mx-3 px-3 border-r border-[#2e2e2e]">
                        11 Nov
                      </span>
                      <span className="py-1">
                        Generate invoice and send an email
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="translate-x-0 transition-transform group-hover:translate-x-0.5 w-3 h-3 ml-1.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </a>
                    <h1 className="text-4xl sm:text-5xl sm:leading-none lg:text-7xl">
                      <span className="block">Effortless Invoicing,</span>
                      <span className="text-brand block md:ml-0">
                        Instant Payments
                      </span>
                    </h1>
                    <p className="pt-2 text-foreground my-3 text-sm sm:mt-5 lg:mb-0 sm:text-base lg:text-lg">
                      Track, manage, and automate your invoices—all in one
                      place.
                      <br className="hidden md:block" />
                      Simplify your billing process and get paid faster with our
                      intuitive invoicing system.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      data-size="medium"
                      type="button"
                      className="relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border bg-black dark:bg-white-500 hover:bg-black/80 dark:hover:bg-white/50 text-white border-brand-500/75 dark:border-brand/30 hover:border-black-600 dark:hover:border-white focus-visible:outline-black-600 data-[state=open]:bg-black-400/80 dark:data-[state=open]:bg-white-500/80 data-[state=open]:outline-black-600 text-sm px-4 py-2 h-[38px]"
                      href="#"
                      onClick={() => handleCTAClick("get_started_free")}
                    >
                      <span className="truncate">Get Started Free</span>
                    </a>
                    <a
                      data-size="medium"
                      type="button"
                      className="relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-foreground bg-alternative dark:bg-muted hover:bg-selection border-strong hover:border-stronger focus-visible:outline-brand-600 data-[state=open]:bg-selection data-[state=open]:outline-brand-600 data-[state=open]:border-button-hover text-sm px-4 py-2 h-[38px]"
                      href="#"
                      onClick={() => handleCTAClick("request_demo")}
                    >
                      <span className="truncate">Request a demo</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HeroOne />
    </div>
  );
}
