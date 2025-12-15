import { components } from "@/components/interfaces/guide/mdx-components";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/interfaces/page/header";
import { getRefund } from "@/lib/data/get-refund"
import MDX from "@thinkthroo/lesson/markdown/mdx";

export default async function RefundPage() {

    const thinkthrooRefund = await getRefund();

    return (
        <div className="container relative">
            <PageHeader>
                <PageHeaderHeading>Refund Policy</PageHeaderHeading>
                <PageHeaderDescription>Effective Date: {thinkthrooRefund.publishedAt}</PageHeaderDescription>
            </PageHeader>
            <div className="mx-auto flex flex-col items-start gap-2 px-4 py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10">
                <div className="">
                    <MDX
                        source={thinkthrooRefund.body}
                        components={components}
                    />
                </div>
            </div>
        </div>
    )
}