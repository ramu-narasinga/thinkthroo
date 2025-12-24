'use client'

import Image from "next/image"
import Link from "next/link"
import { useUmami } from "@/hooks/use-umami"

export const Footer = () => {
    const { track } = useUmami();
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
                                    onClick={() => track('footer-architecture-link', { link: 'shadcn-ui', href: 'https://app.thinkthroo.com/course/codebase-architecture/shadcn-ui/tooling/introduction' })}
                                >
                                    Shadcn/ui codebase architecture
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://app.thinkthroo.com/course/codebase-architecture/supabase/tooling/introduction"
                                    target="_blank"
                                    onClick={() => track('footer-architecture-link', { link: 'supabase', href: 'https://app.thinkthroo.com/course/codebase-architecture/supabase/tooling/introduction' })}
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
                                    onClick={() => track('footer-link', { link: 'production-grade-projects', href: 'https://app.thinkthroo.com/production-grade-projects' })}
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
                                <Link href="https://discord.gg/3kwruUXW4g" target="_blank" onClick={() => track('footer-link', { link: 'discord', href: 'https://discord.gg/3kwruUXW4g' })}>
                                    Discord
                                </Link>
                            </li>
                            <li>
                                <Link href="https://www.instagram.com/thinkthroo" target="_blank" onClick={() => track('footer-link', { link: 'instagram', href: 'https://www.instagram.com/thinkthroo' })}>
                                    Instagram
                                </Link>
                            </li>
                            <li>
                                <Link href="https://x.com/thinkthroo" target="_blank" onClick={() => track('footer-link', { link: 'x.com', href: 'https://x.com/thinkthroo' })}>
                                    X.com
                                </Link>
                            </li>
                            <li>
                                <Link href="https://github.com/thinkthroo" target="_blank" onClick={() => track('footer-link', { link: 'github', href: 'https://github.com/thinkthroo' })}>
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
                                <Link href="https://app.thinkthroo.com/privacy" target="_blank" onClick={() => track('footer-link', { link: 'privacy-policy', href: 'https://app.thinkthroo.com/privacy' })}>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="https://app.thinkthroo.com/terms" target="_blank" onClick={() => track('footer-link', { link: 'terms-and-conditions', href: 'https://app.thinkthroo.com/terms' })}>
                                    Terms and Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="https://app.thinkthroo.com/refund" target="_blank" onClick={() => track('footer-link', { link: 'refund-policy', href: 'https://app.thinkthroo.com/refund' })}>
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