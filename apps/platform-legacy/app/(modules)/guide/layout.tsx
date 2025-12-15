import CommonCourseLayout, { CommonCourseLayoutProps } from "@/components/layouts/guide";

export default function Courselayout({ children }: CommonCourseLayoutProps) {
    return (
        <CommonCourseLayout>
            {children}
        </CommonCourseLayout>
    )
}