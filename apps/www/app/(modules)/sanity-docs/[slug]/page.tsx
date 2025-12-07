import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { PortableTextBlock } from "sanity";
import { Renderer } from "@/app/(modules)/sanity-docs/[slug]/renderer";
import { fetchPostBySlug } from "@/lib/articles";
import { client } from "@/sanity/client";
import { ALL_POSTS_QUERY } from "@/sanity/lib/queries";
import { siteConfig } from "@/lib/config";
import { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";
import { extractTocFromMarkdown } from "@/lib/markdown-utils";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = await fetchPostBySlug(params.slug);

  if (!page) notFound();

  let toc;
  
  if (typeof page.body === 'string') {
    toc = extractTocFromMarkdown(page.body);
  } else if (page.toc) {
    toc = page.toc.map((item: any) => ({
      depth: item.level ?? 0,
      title: (
        <Renderer
          body={{
            ...(item as PortableTextBlock),
            style: undefined,
          }}
        />
      ),
      url: `#${item._key}`,
    }));
  }
  return (
    <DocsPage toc={toc}>
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <DocsBody>
        <Renderer body={page.body} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_POSTS_QUERY)

  return slugs.map((doc: { slug: string }) => ({
    slug: doc.slug
  }))
}

async function getDocFromParams(params: { slug: string }) {
  const slug = params.slug || "";
  const doc = await fetchPostBySlug(slug)

  return doc || null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const doc = await getDocFromParams(resolvedParams)

  if (!doc) {
    return {}
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: absoluteUrl(doc.slug),
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [siteConfig.ogImage],
      creator: "@thinkthroo",
    },
  }
}

