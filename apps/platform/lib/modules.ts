import { client } from "@thinkthroo/lesson/utils/sanity-client";
import { type SanityDocument } from "next-sanity";

const MODULE_QUERY = `
 *[
  _type == "module" &&
  $module in categories[]->title
]{
  title,
  description,
  slug,
  tags[]->{
    title
  },
  "chapter": *[
    _type == "chapter" &&
    references(^._id) &&
    order == 1
  ][0]{ // First chapter referencing this module
    "chapterSlug": slug,
    "lesson": *[
      _type == $lessonType &&
      references(^._id) &&
      order == 1
    ][0]{ // First lesson with order = 1 in this chapter
      "lessonSlug": slug.current
    }
  }
}
`

export async function getModules(module: string, lessonType: string) {
    const params = { module, lessonType };
    const options = { next: { revalidate: 30 } };
  
    const modules = await client.fetch<SanityDocument>(MODULE_QUERY, params, options)
    return modules;
}