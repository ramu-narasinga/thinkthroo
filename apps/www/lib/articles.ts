import { client } from "@/sanity/client";
import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const groupedPostsByMonthQuery = `
  *[_type == "post"] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    publishedAt
  }
`;

export async function fetchGroupedPostsForSidebar() {
    const posts = await client.fetch(groupedPostsByMonthQuery)

    const grouped = posts.reduce((acc: Record<string, any[]>, post) => {
        const date = new Date(post.publishedAt)
        const key = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        })

        if (!acc[key]) acc[key] = []
        acc[key].push({
            title: post.title,
            href: `/blog/${post.slug}`,
        })
        return acc
    }, {})

    // Convert to sidebar config format
    return Object.entries(grouped).map(([month, items]) => ({
        title: month,
        items,
    }))
}

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

export async function fetchPostBySlug(slug: string) {
    const params = { slug };
    const options = { next: { revalidate: 30 } };
    const post = await client.fetch<SanityDocument>(POST_QUERY, params, options);
    return post;
}

const { projectId, dataset } = client.config();
export const urlFor = (source: SanityImageSource) =>
    projectId && dataset
        ? imageUrlBuilder({ projectId, dataset }).image(source)
        : null;