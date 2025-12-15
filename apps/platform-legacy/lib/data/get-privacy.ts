import { client } from "@thinkthroo/lesson/utils/sanity-client";
import { type SanityDocument } from "next-sanity";

const PRIVACY_QUERY = `
  *[_type == "privacy"][0] {
    title,
    slug,
    author->{
      name
    },
    publishedAt,
    body
  }
`;

export async function getPrivacy(): Promise<SanityDocument> {
  const options = { next: { revalidate: 30 } };
  const privacy = await client.fetch<SanityDocument>(PRIVACY_QUERY, {}, options);
  return privacy;
}
