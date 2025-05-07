import { client } from "@thinkthroo/lesson/utils/sanity-client";
import { type SanityDocument } from "next-sanity";

const TERMS_QUERY = `
  *[_type == "terms"][0] {
    title,
    slug,
    author->{
      name
    },
    publishedAt,
    body
  }
`;

export async function getTerms(): Promise<SanityDocument> {
  const options = { next: { revalidate: 30 } };
  const terms = await client.fetch<SanityDocument>(TERMS_QUERY, {}, options);
  return terms;
}
