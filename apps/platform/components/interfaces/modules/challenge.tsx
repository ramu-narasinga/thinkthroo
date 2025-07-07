import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Tag = {
    title: string;
};

type ChallengeProps = {
    title: string;
    slug: { current: string };
    metaDescription: string;
    difficulty: string;
    tags: Tag[];
};

export const Challenge = ({
    title,
    slug,
    metaDescription,
    difficulty,
    tags,
}: ChallengeProps) => {
    return (
        <div className="flex flex-col">
            {/* <div className="w-[680px] h-[140px] relative px-4 py-2 ml-50 flex items-center border border-neutral-300 rounded-md dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <span aria-hidden="true" className="absolute inset-0 z-0" />
            <span className="block text-sm text-foreground mb-16 ml-14">{title}</span>

            <div className="absolute left-4 top-13 flex items-center gap-4">
                <Button
                variant="outline"
                size="icon"
                aria-label="Mark complete"
                className="ml-auto w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-700 hover:text-success dark:hover:text-success"
                >
                <Check className="w-5 h-5" />
                </Button>
                <span className="text-sm">{metaDescription}</span>
                <div className="group cursor-pointer">
                <ChevronRight className="relative left-22 top-2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-black transition-colors" />
                </div>
            </div>

            <div className="absolute bottom-4 ml-14 flex items-center gap-9 text-sm text-muted-foreground z-10">
                <div className="inline-flex items-start gap-1">
                <span className="size-5 text-muted-foreground">💻</span>
                <span>UI coding</span>
                </div>
                <div className={cn("inline-flex items-center gap-1", difficulty === "Easy" && "text-green-600")}>
                <span>🚦</span>
                <span className="mr-4">{difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                    {tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {tag.title}
                        </span>
                    ))}
                </div>
                <div className="inline-flex items-center gap-1.5">
                <Check className="w-5 h-5 text-muted-foreground" />
                <span>32.4k done</span>
                </div>
            </div>
            </div> */}
            <div className="w-[680px] h-[140px] relative px-4 py-2 flex items-center border border-neutral-300 rounded-md dark:border-neutral-700 bg-white dark:bg-neutral-900">
                {/* Background overlay */}
                <span aria-hidden="true" className="absolute inset-0 z-0" />

                {/* Title */}
                <span className="block text-sm text-foreground mb-16 ml-14">{title}</span>

                {/* Mark Complete Button & Description */}
                <div className="absolute left-4 top-13 flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Mark complete"
                        className="ml-auto w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-700 hover:text-success dark:hover:text-success"
                    >
                        <Check className="w-5 h-5" />
                    </Button>
                    <span className="text-sm">
                        {metaDescription}
                    </span>
                    <Link key={slug.current} href={`/challenges/${slug.current}`}>
                        <div className="group cursor-pointer">
                            <ArrowRight className="relative -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-black transition-colors" />
                        </div>
                    </Link>
                </div>

                {/* Tags & Info */}
                <div className="absolute bottom-4 ml-14 flex items-center gap-9 text-sm text-muted-foreground z-10">                

                    {/* Difficulty */}
                    <div className="inline-flex items-center gap-1.5">
                        <Flame className="w-5 h-5 text-muted-foreground" />
                        <span>Easy</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {tags.map((tag, i) => (
                            <Badge key={i} variant="secondary">
                                {tag.title}
                            </Badge>
                        ))}
                    </div>

                    {/* Completion Count */}
                    <div className="inline-flex items-center gap-1.5">
                        <Check className="w-5 h-5 text-muted-foreground" />
                        <span>0 submissions</span>
                    </div>
                </div>
            </div>
        </div>
    );
};