import { Icons } from "@/components/icons";
import Link from "next/link";

export const Module: React.FC<{ courses: any[] }> = ({ courses }) => {

    return (
        <>
            {courses.map((course, index: number) => (
                <Link key={index} href={`/guide/codebase-architecture/${course.slug}/${course?.chapter?.chapterSlug}/${course?.chapter?.lesson?.lessonSlug}`} className="group">
                    <div className="relative flex flex-col overflow-hidden rounded-xl border shadow transition-all duration-200 ease-in-out hover:z-30">
                        <div className="items-center gap-2 relative z-20 flex justify-end border-b bg-card px-3 py-2.5 text-card-foreground">
                            <div className="ml-auto flex items-center gap-2 [&amp;>form]:flex">
                                <button className="inline-flex items-center justify-center h-6 rounded-[6px] border bg-transparent px-2 text-xs">
                                    {course.chapters} Chapters
                                </button>
                                <button className="inline-flex items-center justify-center h-6 rounded-[6px] border bg-transparent px-2 text-xs">
                                    {course.lessons} Lessons
                                </button>
                                <button className="inline-flex items-center justify-center h-6 rounded-[6px] border bg-transparent px-2 text-xs">
                                    Read
                                </button>
                            </div>
                        </div>

                        <div className="relative z-10 bg-card text-card-foreground shadow">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <h3 className="font-semibold leading-none tracking-tight">{course.title}</h3>
                                <p className="text-sm text-muted-foreground">{course.description}</p>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="grid grid-cols-3 gap-2">
                                    {course.tags.map((tag: string, index: number) => (
                                        <div key={index} className="flex items-center">
                                            <Icons.tag />
                                            {tag.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </>
    );
};