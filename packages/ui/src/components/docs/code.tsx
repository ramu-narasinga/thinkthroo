"use client";
import { type JSX, lazy, useRef, useState } from "react";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

export interface CodeProps {
  lang: string;
  code: string;
}

/**
 * Pre-render codeblock on server
 */
function createPreRenderer(props: CodeProps) {
  return lazy(async () => {
    const result = await render(props.lang, props.code);

    return {
      default() {
        return result;
      },
    };
  });
}

const idMap = new Map<string, ReturnType<typeof createPreRenderer>>();

interface Task {
  key: string;
  aborted: boolean;
}

export function Code(props: CodeProps) {
  const key = `${props.lang}:${props.code}`;
  const currentTask = useRef<Task>();
  const [rendered, setRendered] = useState<JSX.Element | null>(() => {
    let Prerender = idMap.get(key);

    if (!Prerender) {
      Prerender = createPreRenderer(props);
      idMap.set(key, Prerender);
    }

    currentTask.current = {
      key,
      aborted: false,
    };

    return <Prerender />;
  });

  // on change
  if (
    typeof window !== "undefined" &&
    (!currentTask.current || currentTask.current.key !== key)
  ) {
    if (currentTask.current) {
      currentTask.current.aborted = true;
    }

    const task: Task = {
      key,
      aborted: false,
    };
    currentTask.current = task;

    render(props.lang, props.code).then((result) => {
      if (task.aborted) return;
      setRendered(result);
    });
  }

  return rendered;
}

async function render(lang: string, code: string) {
  if (!code) return null;

  const { getSingletonHighlighter } = await import("shiki/bundle/web");
  const highlighter = await getSingletonHighlighter({
    langs: [lang],
    themes: ["vesper", "one-light"],
  });

  const hast = highlighter.codeToHast(code, {
    lang,
    themes: {
      light: "one-light",
      dark: "vesper",
    },
    defaultColor: false,
    transformers: [
      {
        // add empty space to empty lines, so it has a height in 'display: grid' layout
        line(line) {
          if (line.children.length === 0) {
            line.children.push({
              type: "text",
              value: " ",
            });
          }
        },
      },
    ],
  });

  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    development: false,
    components: {
      pre: (props) => (
        <CodeBlock keepBackground {...props}>
          <Pre>{props.children}</Pre>
        </CodeBlock>
      ),
    },
  });
}
