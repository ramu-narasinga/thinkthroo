import { registerRoot } from "remotion"

import BlogExample from "./compositions/blog-example"
import Matt from "./compositions/matt"
import Delba from "./compositions/delba"
import Ram from "./compositions/ram"

registerRoot(function RemotionRoot() {
  return (
    <>
      <BlogExample />
      <Matt />
      <Delba />
      <Ram />
    </>
  )
})
