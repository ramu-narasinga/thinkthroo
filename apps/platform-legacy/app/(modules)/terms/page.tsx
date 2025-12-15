import { components } from "@/components/interfaces/guide/mdx-components";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/interfaces/page/header";
import { getTerms } from "@/lib/data/get-terms"
import MDX from "@thinkthroo/lesson/markdown/mdx";

export default async function TermsPage() {

    const thinkthrooTerms = await getTerms();

    return (
        <div className="container relative">
            <PageHeader>
                <PageHeaderHeading>Terms of Service</PageHeaderHeading>
                <PageHeaderDescription>Effective Date: {thinkthrooTerms.publishedAt}</PageHeaderDescription>
            </PageHeader>
            <div className="mx-auto flex flex-col items-start gap-2 px-4 py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10">
                <div className="">
                    <MDX
                        source={thinkthrooTerms.body}
                        components={components}
                    />
                </div>
            </div>
        </div>
    )
}