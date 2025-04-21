import { Doc } from "@/.contentlayer/generated";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedThumb(props: {doc: any}) {
    return (
        <div key={"string-raw"} className="w-full">
            <Link
                href={`/blog/${props.doc.slug.current}`}
                className="grid gap-4 lg:grid-cols-7 lg:gap-8 xl:gap-12 hover:bg-surface-200 dark:hover:bg-surface-75 p-2 sm:p-4 rounded-xl"
            >
            <div className="relative w-full aspect-[2/1] lg:col-span-3 lg:aspect-[3/2] overflow-auto rounded-lg border">
            <Image
                src={`/architecture.png`}
                fill
                sizes="100%"
                quality={100}
                className="object-cover"
                alt="blog thumbnail"
            />
            </div>
            <div className="flex flex-col space-y-2 lg:col-span-4 xl:justify-center max-w-xl">
                <div className="text-lighter flex space-x-2 text-sm">
                    <span>30 September 2024</span>
                    <span>•</span>
                    <span>3 minute read</span>
                </div>

                <div>
                    <h2 className="h2 lg:!text-2xl xl:!text-3xl !mb-2">{props?.doc?.title}</h2>
                    <p className="p xl:text-lg">{props.doc.description}</p>
                </div>

                {/* <div className="flex flex-col w-max gap-2">
                    <div className="flex items-center space-x-2">
                        <div className="relative h-6 w-6 overflow-auto">
                            <Image
                                src={`/authors/ram.svg`}
                                alt={`Ram avatar`}
                                className="rounded-full object-cover"
                                fill
                                sizes="30px"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-foreground m-0 text-sm">Ram</span>
                        </div>    
                    </div>
                </div> */}
            </div>
            </Link>
        </div>
    )
}