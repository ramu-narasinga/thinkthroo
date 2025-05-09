import { client } from "@thinkthroo/lesson/utils/sanity-client";
import { type SanityDocument } from "next-sanity";

const REFUND_QUERY = `
  *[_type == "refund"][0] {
    title,
    slug,
    author->{
      name
    },
    publishedAt,
    body
  }
`;

export async function getRefund(): Promise<SanityDocument> {
  const options = { next: { revalidate: 30 } };
  const refund = await client.fetch<SanityDocument>(REFUND_QUERY, {}, options);
  return refund;
}
