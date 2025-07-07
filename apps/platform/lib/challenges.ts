import { client } from "@thinkthroo/lesson/utils/sanity-client"
import { type SanityDocument } from "next-sanity"

const CHALLENGE_QUERY = `
  *[
    _type == "challenge"
    ] | order(order asc) {
    title,
    slug,
    metaDescription,
    difficulty,
    "tags": tags[]->{
      title
    },
    "categories": categories[]->{
      title
    }
  }
`

export async function getChallenges() {
    const options = { next: { revalidate: 30 } }
    const challenges = await client.fetch<SanityDocument[]>(CHALLENGE_QUERY, {}, options)
    return challenges
}

const SINGLE_CHALLENGE_QUERY = `
  *[_type == "challenge" && slug.current == $slug][0] {
    title,
    slug,
    metaDescription,
    difficulty,
    description,
    "tags": tags[]->{
      title
    },
    "categories": categories[]->{
      title
    }
  }
`

export async function getChallengeBySlug(slug: string) {
  
    const options = { next: { revalidate: 30 } }
    const challenge = await client.fetch<SanityDocument>(SINGLE_CHALLENGE_QUERY, { slug }, options)
    return challenge
}