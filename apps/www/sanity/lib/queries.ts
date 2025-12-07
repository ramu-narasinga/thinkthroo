// Query to fetch all posts (for generateStaticParams and sidebar)
export const ALL_POSTS_QUERY = `
    *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[]{
      "slug": slug.current,
      "title": title,
      publishedAt
    }
`

// Query to fetch a single post by slug
export const POST_QUERY = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    description,
    slug,
    body,
    categories,
    links
  }
`