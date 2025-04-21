'use client'

import Image from "next/image"

export const Footer = () => {
    return (
        <div className="max-w-[80rem] mt-24 mx-auto px-6 md:px-8">
            <footer className="pb-24 md:pt-32 md:pb-32 border-t border-gray-900/10 relative">
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
    )
}