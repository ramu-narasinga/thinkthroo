import { client } from "@thinkthroo/lesson/utils/sanity-client";
import { type SanityDocument } from "next-sanity";

const POST_QUERY = `
  *[
    _type == $category &&
    slug.current == $slug
  ][0]
`;

export async function fetchLessonBySlug(slug: string, category: string) {
  const params = { slug, category };

  console.log("fetchLessonBySlug", params);

  const options = { next: { revalidate: 30 } };

  const post = await client.fetch<SanityDocument>(POST_QUERY, params, options);
  return post;
}

const CHAPTERS_QUERY = `
  *[
  _type == "chapter" &&
  $slug in module[]->slug
] | order(order asc) {
  title,
  order,
  "lessons": *[
    _type == "codebaseArchitecture" &&
    ^._id in chapter[]._ref
  ] | order(order asc) {
    title,
    "slug": slug.current,
    order
  }
}
`;
export async function fetchChaptersByModuleSlug(slug: string) {
  const params = { slug }; // must be a string
  const options = { next: { revalidate: 30 } };

  const chapters = await client.fetch<SanityDocument>(CHAPTERS_QUERY, params, options);
  return chapters;
}
