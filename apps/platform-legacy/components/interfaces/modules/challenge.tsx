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
            <div className="w-[680px] h-[140px] relative px-4 py-2 flex justify-between items-center border border-neutral-300 rounded-md dark:border-neutral-700 bg-white dark:bg-neutral-900">
                <div className="">
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Mark complete"
                        className="ml-auto w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-700 hover:text-success dark:hover:text-success"
                    >
                        <Check className="w-5 h-5" />
                    </Button>
                </div>
                <div className="text-md flex flex-col gap-2">
                    <span className="block text-foreground font-medium">{title}</span>
                    <span className="">{metaDescription}</span>
                    <div className="flex gap-6">
                        <div className="inline-flex items-center gap-1.5">
                            <Flame className="w-5 h-5 text-muted-foreground" />
                            <span>{difficulty}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="font-normal text-md">
                                    {tag.title}
                                </Badge>
                            ))}
                        </div>

                        <div className="inline-flex items-center gap-1.5">
                            <Check className="w-5 h-5 text-muted-foreground" />
                            <span>0 submissions</span>
                        </div>
                    </div>
                </div>

                <div className="">
                    <Link key={slug.current} href={`/challenges/${slug.current}`}>
                        <div className="group cursor-pointer">
                            <ArrowRight className="relative -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-black transition-colors" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};