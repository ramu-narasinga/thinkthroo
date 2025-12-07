'use client'

import Image from "next/image"
import Link from "next/link"

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
                                <Link
                                    href="https://app.thinkthroo.com/course/codebase-architecture/shadcn-ui/tooling/introduction"
                                    target="_blank"
                                >
                                    Shadcn/ui codebase architecture
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://app.thinkthroo.com/course/codebase-architecture/supabase/tooling/introduction"
                                    target="_blank"
                                >
                                    Supabase codebase architecture
                                </Link>
                            </li>
                            
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-gray-900 font-semibold text-sm leading-5">
                            Research & Development
                        </h3>
                        <ul role="list" className="mt-6 space-y-4">
                            <li>
                                <Link
                                    href="https://app.thinkthroo.com/production-grade-projects"
                                    target="_blank"
                                >
                                    Production-Grade Projects
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-gray-900 font-semibold text-sm leading-5">
                            Community
                        </h3>
                        <ul role="list" className="mt-6 space-y-4">
                            <li>
                                <Link href="https://discord.gg/3kwruUXW4g" target="_blank">
                                    Discord
                                </Link>
                            </li>
                            <li>
                                <Link href="https://www.instagram.com/thinkthroo" target="_blank">
                                    Instagram
                                </Link>
                            </li>
                            <li>
                                <Link href="https://x.com/thinkthroo" target="_blank">
                                    X.com
                                </Link>
                            </li>
                            <li>
                                <Link href="https://github.com/thinkthroo" target="_blank">
                                    Github
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-gray-900 font-semibold text-sm leading-5">
                            Legal
                        </h3>
                        <ul role="list" className="mt-6 space-y-4">
                            <li>
                                <Link href="https://app.thinkthroo.com/privacy" target="_blank">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="https://app.thinkthroo.com/terms" target="_blank">
                                    Terms and Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="https://app.thinkthroo.com/refund" target="_blank">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>
            </footer>
        </div>
    )
}