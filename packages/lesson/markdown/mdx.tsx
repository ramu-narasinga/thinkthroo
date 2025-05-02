// 'use client'

import {
  MDXRemote,
  MDXRemoteSerializeResult,
  type MDXRemoteProps,
} from 'next-mdx-remote/rsc'
import { serialize } from 'next-mdx-remote/serialize'
import {CH} from '@code-hike/mdx/components'
import mdxComponents from './mdx-components'

const defaultComponents = {
  CH,
  ...mdxComponents,
}

/**
 * Renders compiled source from @skillrecordings/skill-lesson/markdown/serialize-mdx
 * with syntax highlighting and code-hike components.
 * @param {MDXRemoteSerializeResult} contents
 * @returns <MDXRemote components={components} {...contents} />
 */

const MDX = ({
  source,
  components,
}: {
  source: string,
  components?: MDXRemoteProps['components']
}) => {

  return (
    <MDXRemote
      components={{...defaultComponents, ...components}}
      source={source}
    />
  )
}

export default MDX