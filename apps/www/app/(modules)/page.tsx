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

export default function RootPage() {
  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Insights from Open Source projects</PageHeaderHeading>
        <PageHeaderDescription>
          Hey, my name is <a href="https://ramunarasinga.com" className="underline">Ramu Narasinga</a>. 
          I study large open-source projects and provide a detailed codebase architecture of Shadcn/ui, LobeChat. I created this learning platform to compare the feature implementation in 
          OSS projects against documentation and share the best practices found in OSS so you can learn advanced 
          techniques and unique coding patterns.
        </PageHeaderDescription>
        
        <PageActions>
          <Button asChild size="sm">
            <Link
              target="_blank"
              rel="noreferrer"
              href={siteConfig.links.learningPlatform}
            >
              Get Started For Free
            </Link>
          </Button>
        </PageActions>
      </PageHeader>

      <div className="ring-gray-900/10 ring-inset custom-ring p-2 bg-gray-900/5 rounded-lg -m-2">
        <Link href="https://app.thinkthroo.com/architecture" target="_blank">
          <Image
            alt="App screenshot"
            src="/architecture.png"
            width="2432"
            height="1442"
            className="aej bcf bcp bdl"
          />
        </Link>
      </div>

      <div className="lg:px-8 px-6 max-w-7xl mt-24 mx-auto">
        <div className="mx-auto">
          <h2 className="text-black font-semibold text-base leading-6">
            Build a maintainable codebase
          </h2>
          <p className="mt-2 text-gray-900 font-bold text-lg leading-9 sm:text-2xl sm:leading-10 tracking-tight">
            Study how large open-source projects architect their codebase
          </p>
          <p className="mt-6 text-gray-600 text-base leading-8">
            Learn how to structure your codebase, decide the tooling required,
            follow the best practices.
          </p>
        </div>
        <div className="mt-16 mt-16 mx-auto">
          <dl className="grid gap-10 sm:gap-10 sm:col-gap-8 max-w-lg md:grid-cols-2 md:max-w-none">
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-wrench lucide-icon customizable text-white w-6 h-6"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                  </div>
                  Tooling
                </dt>

                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Tools such as ESLint that help you write, test, and manage
                  their code more easily and efficiently.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-pyramid text-white w-6 h-6"
                    >
                      <path d="M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-1.98 0Z" />
                      <path d="M12 2v20" />
                    </svg>
                  </div>
                  Project Structure
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Project Structure in a large open-source codebase organizes
                  files and directories to enhance clarity and navigation for
                  developers exploring the project.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-layout-panel-top text-white w-6 h-6"
                    >
                      <rect width="18" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                    </svg>
                  </div>
                  Components Structure
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Components Structure defines how reusable UI elements are
                  organized within an open-source project, promoting modularity
                  and ease of integration.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-orbit text-white w-6 h-6"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="19" cy="5" r="2" />
                      <circle cx="5" cy="19" r="2" />
                      <path d="M10.4 21.9a10 10 0 0 0 9.941-15.416" />
                      <path d="M13.5 2.1a10 10 0 0 0-9.841 15.416" />
                    </svg>
                  </div>
                  API Layer
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  The API Layer serves as a bridge in large codebases, enabling
                  smooth communication between the front-end and back-end
                  components through well-defined interfaces.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-blocks text-white w-6 h-6"
                    >
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
                    </svg>
                  </div>
                  State Management
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  State Management in large open-source projects outlines how
                  data is handled and shared across components, ensuring a
                  consistent experience for users.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-test-tube text-white w-6 h-6"
                    >
                      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2" />
                      <path d="M8.5 2h7" />
                      <path d="M14.5 16h-5" />
                    </svg>
                  </div>
                  Testing
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Testing in open-source codebases involves creating and running
                  tests to confirm that various parts of the application
                  function correctly, ensuring reliability.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-server-crash text-white w-6 h-6"
                    >
                      <path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                      <path d="M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2" />
                      <path d="M6 6h.01" />
                      <path d="M6 18h.01" />
                      <path d="m13 6-4 6h6l-4 6" />
                    </svg>
                  </div>
                  Error Handling
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Error Handling strategies in large codebases help developers
                  anticipate, manage, and provide feedback on errors to maintain
                  stability and user experience.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-shield-check text-white w-6 h-6"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  Security
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Security measures in open-source projects focus on protecting
                  the codebase from vulnerabilities and unauthorized access,
                  which is vital for community trust.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-gauge text-white w-6 h-6"
                    >
                      <path d="m12 14 4-4" />
                      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                  </div>
                  Performance
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Performance optimization in large codebases aims to enhance
                  speed and responsiveness, improving user satisfaction and
                  efficiency.
                </dd>
              </div>
            </Link>
            <Link
              href="https://app.thinkthroo.com/architecture"
              target="_blank"
            >
              <div className="pl-16 relative">
                <dt className="text-gray-900 font-semibold text-base leading-7 underline">
                  <div className="bg-black rounded-md flex justify-center items-center w-10 h-10 absolute top-0 left-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-rocket text-white w-6 h-6"
                    >
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                  </div>
                  Deployment
                </dt>
                <dd className="text-gray-600 text-base leading-6 mt-2">
                  Deployment in the context of open-source projects refers to
                  the process of making the application accessible to users by
                  moving it from a development environment to production.
                </dd>
              </div>
            </Link>
          </dl>
        </div>
      </div>

      {/* FIXME: Should be moved to SiteFooter and placed in layout.tsx */}
      <div className="max-w-[80rem] mt-24 mx-auto px-6 md:px-8">
        <footer className="pt-24 pb-24 md:pt-32 md:pb-32 mt-36 border-t border-gray-900/10 relative">
          <h2
            id="footer-heading"
            className="absolute w-1 h-1 p-0 -m-px overflow-hidden clip-rect-0 border-0 whitespace-nowrap"
          >
            Footer
          </h2>

          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                alt="Think Throo"
                src="/logo.svg"
                className="h-7"
                height={24}
                width={24}
              />
              <div className="text-gray-900 font-semibold">Think Throo</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-12 gap-x-6 lg:gap-x-16 mt-12">
            <div>
              <h3 className="text-gray-900 font-semibold text-sm leading-5">
                Codebase Architecture
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a
                    href="https://app.thinkthroo.com/course/codebase-architecture/shadcn-ui/tooling/introduction"
                    target="_blank"
                    className="text-gray-600 text-sm leading-5"
                  >
                    Shadcn/ui codebase architecture
                  </a>
                </li>
                <li>
                  <a
                    href="https://app.thinkthroo.com/course/codebase-architecture/supabase/tooling/introduction"
                    target="_blank"
                    className="text-gray-600 text-sm leading-5"
                  >
                    Supabase codebase architecture
                  </a>
                </li>
                <li>
                  <a
                    href="https://app.thinkthroo.com/course/codebase-architecture/cal-com/tooling/introduction"
                    target="_blank"
                    className="text-gray-600 text-sm leading-5"
                  >
                    Cal.com codebase architecture
                  </a>
                </li>
                <li>
                  <a
                    href="https://app.thinkthroo.com/course/codebase-architecture/lobechat/tooling/introduction"
                    target="_blank"
                    className="text-gray-600 text-sm leading-5"
                  >
                    Lobechat codebase architecture
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold text-sm leading-5">
                Research & Development
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a
                    href="https://app.thinkthroo.com/best-practices"
                    target="_blank"
                    className="text-gray-600 text-sm leading-5"
                  >
                    Best Practices
                  </a>
                </li>
                <li>
                  <a
                    href="https://app.thinkthroo.com/production-grade-projects"
                    target="_blank"
                    className="text-gray-600 text-sm leading-5"
                  >
                    Production-Grade Projects
                  </a>
                </li>
                <li>
                  <a
                    href="https://app.thinkthroo.com/build-from-scratch"
                    target="_blank"
                    className="text-gray-600 text-sm leading-5"
                  >
                    Build From Scratch
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold text-sm leading-5">
                Community
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a href="https://discord.gg/3kwruUXW4g" className="text-gray-600 text-sm leading-5">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="https://www.youtube.com/@thinkthroo" className="text-gray-600 text-sm leading-5">
                    Youtube
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/thinkthroo" className="text-gray-600 text-sm leading-5">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=61554871892197" className="text-gray-600 text-sm leading-5">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="https://x.com/thinkthroo" className="text-gray-600 text-sm leading-5">
                    X.com
                  </a>
                </li>
                <li>
                  <a href="https://github.com/thinkthroo" className="text-gray-600 text-sm leading-5">
                    Github
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-900 font-semibold text-sm leading-5">
                Legal
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                <li>
                  <a href="#" className="text-gray-600 text-sm leading-5">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 text-sm leading-5">
                    Terms and Conditions
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </footer>
      </div>
    </div>
  );
}
