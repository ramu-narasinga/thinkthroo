import { components } from "@/components/interfaces/guide/mdx-components";
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/interfaces/page/header";
import { getPrivacy } from "@/lib/data/get-privacy"
import MDX from "@thinkthroo/lesson/markdown/mdx";

export default async function PrivacyPage() {

    const thinkthrooPrivacy = await getPrivacy();

    return (
        <div className="container relative">
            <PageHeader>
                <PageHeaderHeading>Privacy Policy</PageHeaderHeading>
                <PageHeaderDescription>Effective Date: {thinkthrooPrivacy.publishedAt}</PageHeaderDescription>
            </PageHeader>
            <div className="mx-auto flex flex-col items-start gap-2 px-4 py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10">
                <div className="">
                    <MDX
                        source={thinkthrooPrivacy.body}
                        components={components}
                    />
                </div>
            </div>
        </div>
    )
}