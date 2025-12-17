"use client";
import { PortableTextBlock } from "sanity";
import {
  PortableText,
  PortableTextComponentProps,
  PortableTextReactComponents,
} from "@portabletext/react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Heading } from "fumadocs-ui/components/heading";
import { Card } from "fumadocs-ui/components/card";
import { Code } from "@thinkthroo/ui/components/code";
import { urlFor } from "@/sanity/lib/image";
import { getImageDimensions } from "@sanity/asset-utils";
import { buildMarksTree } from "@portabletext/toolkit";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";

function Image({ value, isInline }: { value: any; isInline: boolean }) {
  const dimensions = getImageDimensions(value);

  return (
    <img
      src={urlFor(value)
        .width(isInline ? 100 : 800)
        .fit("max")
        .auto("format")
        .url()}
      alt={value.alt || " "}
      style={{
        // Display alongside text if image appears inside a block text span
        display: isInline ? "inline-block" : "block",

        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: dimensions.aspectRatio,
      }}
    />
  );
}

const headingLevels = new Array(5).fill(0).map((_, i) => i + 1);
const headingBlocks = Object.fromEntries(
  headingLevels.map((h) => {
    return [
      `h${h}`,
      (props: PortableTextComponentProps<PortableTextBlock>) => {
        const { value, children } = props;
        const { _key } = value;

        return (
          <Heading id={_key} as={`h${h}` as "h1"}>
            {children}
          </Heading>
        );
      },
    ];
  }),
);

// Add handler for normal paragraphs and other block types
const blockComponents = {
  ...headingBlocks,
  normal: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
    <p>{children}</p>
  ),
  blockquote: ({ children }: PortableTextComponentProps<PortableTextBlock>) => (
    <blockquote>{children}</blockquote>
  ),
};

const components: Partial<PortableTextReactComponents> = {
  block: blockComponents as PortableTextReactComponents["block"],
  marks: {
    link: (props) => (
      <defaultMdxComponents.a href={props.value.href} key={props.markKey}>
        {props.children}
      </defaultMdxComponents.a>
    ),
  },
  types: {
    image: Image,
    code: (props) => (
      <Code lang={props.value.language} code={props.value.code} />
    ),
    card: (props) => {
      const children = buildMarksTree(props.value).map((child: any, i) =>
        props.renderNode({
          node: child,
          isInline: false,
          index: i,
          renderNode: props.renderNode,
        }),
      );

      return (
        <Card href={props.value.url} title={props.value.title}>
          {children}
        </Card>
      );
    },
  },
};

export function Renderer({
  body,
}: {
  body: PortableTextBlock | PortableTextBlock[] | string;
}) {
  // If body is a string, render as markdown
  if (typeof body === "string") {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <defaultMdxComponents.h1 id={id} {...props}>
                {children}
              </defaultMdxComponents.h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <defaultMdxComponents.h2 id={id} {...props}>
                {children}
              </defaultMdxComponents.h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <defaultMdxComponents.h3 id={id} {...props}>
                {children}
              </defaultMdxComponents.h3>
            );
          },
          h4: ({ children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <defaultMdxComponents.h4 id={id} {...props}>
                {children}
              </defaultMdxComponents.h4>
            );
          },
          h5: ({ children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <defaultMdxComponents.h5 id={id} {...props}>
                {children}
              </defaultMdxComponents.h5>
            );
          },
          h6: ({ children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              <defaultMdxComponents.h6 id={id} {...props}>
                {children}
              </defaultMdxComponents.h6>
            );
          },
          p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
          a: ({ children, href, ...props }) => (
            <defaultMdxComponents.a href={href} {...props}>
              {children}
            </defaultMdxComponents.a>
          ),
          code: ({ children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";
            const isInline = !className;

            if (isInline) {
              return (
                <code
                  className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <Code lang={lang} code={String(children).replace(/\n$/, "")} />
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-2 pl-6 italic">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="my-6 ml-6 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="my-6 ml-6 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mt-2">{children}</li>,
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt || ""} className="rounded-lg my-6" />
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    );
  }

  // Otherwise, render as Portable Text
  return <PortableText value={body} components={components} />;
}
