import { Icons } from "@/components/icons"
import { SidebarNavItem } from "@/types/nav"

export interface NavItem {
    title: string
    href?: string
    disabled?: boolean
    external?: boolean
    icon?: keyof typeof Icons
    label?: string
}

export interface MainNavItem extends NavItem {}

export interface DocsConfig {
  mainNav: MainNavItem[],
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Architecture",
      href: "/architecture",
    },
    {
      title: "Best Practices",
      href: "/best-practices",
    },
    {
      title: "Production Grade Projects",
      href: "/production-grade-projects",
    },
    {
      title: "Build From Scratch",
      href: "/build-from-scratch",
    }
  ],
  sidebarNav: [
    {
      title: "February, 2025",
      items: [
        {
          title: "Preact in react-scan...",
          href: "/blog/preact-in-react-scan",
          items: []
        },
        {
          title: "Here’s how the options...",
          href: "/blog/react-scan-options-validate",
          items: []
        },
        {
          title: "DOMParser() usage...",
          href: "/blog/react-scan-source-code",
          items: []
        },
        {
          title: "Bippy, a toolkit....",
          href: "/blog/bippy-into-react-internals",
          items: []
        },
        {
          title: "How to check node...",
          href: "/blog/how-to-check-nodeversion",
          items: []
        },
        {
          title: "You are familiar with npm...",
          href: "/blog/what-is-tnpm-cnpm",
          items: []
        },
        {
          title: "Part 2-How to install npm...",
          href: "/blog/part-2-npm-package-install",
          items: []
        },
        {
          title: "Part 1-How to install npm...",
          href: "/blog/part-1-npm-package-install",
          items: []
        },
        {
          title: "father, an npm development tool",
          href: "/blog/father-npm-tool",
          items: []
        }
      ]
    },
    {
      title: "January, 2025",
      items: [
        {
          title: "useSyncExternalStore usage ...",
          href: "/blog/usesyncexternalstore-in-tiptap",
          items: []
        },
        {
          title: "How to check if a component ...",
          href: "/blog/check-component-is-froward-ref",
          items: []
        },
        {
          title: "flushSync in TipTap ...",
          href: "/blog/flush-sync-in-tiptap",
          items: []
        },
        {
          title: "Check if component is class ...",
          href: "/blog/check-if-class-component",
          items: []
        },
        {
          title: "ReactPortal type in ...",
          href: "/blog/reactportal-type-in-tiptap",
          items: []
        },
        {
          title: "__useInternal() in Grida codebase ...",
          href: "/blog/useinternal-in-grida",
          items: []
        },
        {
          title: "toolbar_value_to_cursormode function ...",
          href: "/blog/toolbar-value-to-cursor-mode",
          items: []
        },
        {
          title: "Toolbar's setCursorMode in Grida ...",
          href: "/blog/setcursormode-in-grida",
          items: []
        },
        {
          title: "Locating the toolbar code ...",
          href: "/blog/locating-toolbar-in-grida",
          items: []
        },
        {
          title: "Locating the canvas route ...",
          href: "/blog/canvas-route-in-grida",
          items: []
        },
        {
          title: "Citty, an elegant CLI ...",
          href: "/blog/citty-cli-builder",
          items: []
        },
        {
          title: "List filenames recursively ...",
          href: "/blog/list-filesnames-recursively",
          items: []
        },
        {
          title: "assert in Nodejs and ...",
          href: "/blog/assert-in-grida",
          items: []
        },
        {
          title: "Have you ever used `git submodules`",
          href: "/blog/have-you-used-git-submodules",
          items: []
        },
        {
          title: "lodash._merge vs Defu",
          href: "/blog/lodash-merge-vs-defu",
          items: []
        },
        {
          title: "pretty-bytes usage in unbuild...",
          href: "/blog/pretty-bytes-in-unbuild",
          items: []
        },
        {
          title: "Hookable package in unbuild...",
          href: "/blog/hookable-package-in-unbuild",
          items: []
        },
        {
          title: "Defu usage in unbuild...",
          href: "/blog/defu-usage-in-unbuild",
          items: []
        },
        {
          title: "Jiti usage in Docusaurus...",
          href: "/blog/jiti-in-docusaurus",
          items: []
        },
        {
          title: ".gitkeep file in Shadcn/ui...",
          href: "/blog/gitkeep-in-shadcn",
          items: []
        },
        {
          title: "renovate.json file in Lobechat ...",
          href: "/blog/renovate-in-lobechat",
          items: []
        },
        {
          title: "Gitmoji uses unbuild ...",
          href: "/blog/gitmoji-uses-unbuild",
          items: []
        },
        {
          title: "Maintenance mode check in ...",
          href: "/blog/maintenance-mode-in-nextjs",
          items: []
        },
      ]
    },
    {
      title: "December, 2024",
      items: [
        {
          title: "Custom schema specific Supabase Client...",
          href: "/blog/grida-custom-schema-supabase-client",
          items: []
        },
        {
          title: "Custom schema specific Supabase Server...",
          href: "/blog/grida-custom-schema-server-client",
          items: []
        },
        {
          title: "Here's how next-runtime- ...",
          href: "/blog/next-runtime-env-regex-test",
          items: []
        },
        {
          title: "hCaptcha, a bot detect ...",
          href: "/blog/hcaptcha-usage-in-oss-projects",
          items: []
        },
        {
          title: "Cache your function ...",
          href: "/blog/react-cache-in-server-components",
          items: []
        },
        {
          title: "What does Supabase use for its Authentication?",
          href: "/blog/supabase-authentication",
          items: []
        },
        {
          title: "ProcessEnv type in next-runtime-env source code",
          href: "/blog/process-env-type",
          items: []
        },
        {
          title: "LobeChat uses Namespace for action...",
          href: "/blog/lobechat-uses-namespaces-actions",
          items: []
        },
        {
          title: "How to configure DevTools...",
          href: "/blog/configure-devtools-for-zustand",
          items: []
        },
        {
          title: "next-runtime-env usage in Documenso",
          href: "/blog/nextruntimeenv-in-documenso",
          items: []
        },
        {
          title: "Is it possible to upload...",
          href: "/blog/upload-file-to-db-in-nextjs",
          items: []
        },
        {
          title: "Comparison of S3 upload feature...",
          href: "/blog/comparing-s3-upload-feature",
          items: []
        },
        {
          title: "ts-pattern usage in Documenso...",
          href: "/blog/ts-pattern-in-documenso",
          items: []
        },
        {
          title: "How Documenso, an open-source...",
          href: "/blog/pdf-file-upload-in-documenso",
          items: []
        },
        {
          title: "Comparison of the middleware implementation...",
          href: "/blog/middleware-in-supabase-auth-example",
          items: []
        },
        {
          title: "How the userId is added...",
          href: "/blog/user-id-in-trpc-context",
          items: []
        },
        {
          title: "Dynamic form in LobeChat source code.",
          href: "/blog/dynamic-form-in-lobechat",
          items: []
        },
        {
          title: "How Supabase implemented micro-frontends using Multi Zones in Next.js",
          href:"/blog/micro-frontend-in-supabase",
          items: []
        },
        {
          title: "What's the `ee` folder in open-source projects?",
          href:"/blog/ee-folder-in-oss",
          items: []
        },
        {
          title: "useMemo usage in Documenso, an open-source Docusign alternative.",
          href:"/blog/usememo-usage-in-documenso",
          items: []
        },
        {
          title: "Here's how AI-powered autocompletion is implemented in Novel, an open-source text editor",
          href:"/blog/novel-ai-powered",
          items: []
        },
        {
          title: "Copilotkit usage in Postiz",
          href:"/blog/copilotkit-usage-in-postiz",
          items: []
        },
      ]
    },
    {
      title: "November, 2024",
      items: [
        {
          title: "What if CodeMirror v6 dev setup uses Degit internally to clone packages?",
          href:"/blog/codemirror-degit",
          items: []
        },
        {
          title: "Execa vs using child_process to execute CLI commands programmatically.",
          href:"/blog/execa-child-process-examples",
          items: []
        },
        {
          title: "How CodeMirror v6 dev setup installs packages without a monorepo",
          href:"/blog/codemirror-packages-install",
          items: []
        },
        {
          title: "How CodeMirror v6 dev setup retrieves packages without a monorepo",
          href: "/blog/codemirror-packages-retrieve",
          items: []
        },
        {
          title: "How CodeMirror v6 setup command handles CLI arguments?",
          href: "/blog/codemirror-cli-parse",
          items: []
        },
        {
          title: "How Changsets reads config.json internally",
          href: "/blog/changesets-reads-config",
          items: []
        },
        {
          title: "@manypkg/get-packages usage in Changesets",
          href: "/blog/get-packages-usage-changesets",
          items: []
        },
        {
          title: "Node.js util module usage in Changesets",
          href: "/blog/nodejs-util-module",
          items: []
        },
        {
          title: "How to temporarily silence logs in tests",
          href: "/blog/silence-logs-in-test",
          items: []
        },
        {
          title: "Logger package in changesets monorepo",
          href: "/blog/logger-package-in-changesets",
          items: []
        },
        {
          title: "ClientOptions interface in T3 Env source code explained",
          href: "/blog/client-options-interface",
          items: []
        },
        {
          title: "ExtendableError usage in changesets errors package",
          href: "/blog/extendable-error-changesets",
          items: []
        },
        {
          title: "Scan for CLI flags and arguments using MRI package",
          href: "/blog/mri-scan-cli-flags",
          items: []
        },
        {
          title: "EnvOptions type in T3 Env source code explained",
          href: "/blog/envoptions-type",
          items: []
        },
        {
          title: "A comparison of metadata configurations between Lobechat and Shadcn/ui",
          href: "/blog/lobechat-vs-shadcn-metadata",
          items: [],
        },
        {
          title: "Biome.js, a toolchain to format and lint your web project",
          href: "/blog/biome-tool-chain",
          items: [],
        },
        {
          title: "Bunchee, a bundler for JS/TS package",
          href: "/blog/bunchee-bundler",
          items: [],
        },
        {
          title: "Generate a documentation site using Nextra",
          href: "/blog/generate-doc-with-nextra",
          items: [],
        },
        {
          title: "Manage your versioning and changelogs using Changesets",
          href: "/blog/manage-version-changelog",
          items: [],
        },
        {
          title: "Lobechat applies typesafety to its environment variables",
          href: "/blog/t3-env-in-lobechat",
          items: [],
        }
      ]
    },
    {
      title: "October, 2024",
      items: [
        {
          title: "arrayToDict function in tRPC source code",
          href: "/blog/arrayToDict-function",
          items: [],
        },
        {
          title: "httpBatchLink types in tRPC source code explained",
          href: "/blog/httpBatchLink-types",
          items: [],
        },
        {
          title: "Istanbul usage in tRPC source code",
          href: "/blog/Istanbul-usage",
          items: [],
        },
        {
          title: "IndexedDB explained",
          href: "/blog/IndexedDB-explained",
          items: [],
        },
        {
          title: "Usage of Dexie, an IndexedDB wrapper, in Lobechat",
          href: "/blog/Usage-of-Dexie",
          items: [],
        },
        {
          title: "rollup-plugin-analyzer usage in trpc scripts",
          href: "/blog/rollup-plugin-analyzer-usage",
          items: [],
        },
        {
          title: "analyzeSizeChange script in tRPC source code",
          href: "/blog/analyzeSizeChange-script-in-tRPC",
          items: [],
        },
        {
          title: "kodiak.toml in tRPC source code",
          href: "/blog/kodiak-toml-in-tRPC",
          items: [],
        },
        {
          title: "codecov.yml in Lobechat source code",
          href: "/blog/codecov-yml-in-Lobechat",
          items: [],
        },
        {
          title: "Dosu bot usage in lobechat",
          href: "/blog/dosu-bot-usage-in-lobechat",
          items: [],
        },
        {
          title: "Create a unique array using Set() in JavaScript",
          href: "/blog/Create-a-unique-array",
          items: [],
        },
        {
          title: "Component decorator in TypeDoc",
          href: "/blog/component-decorator-in-typedoc",
          items: [],
        },
        {
          title: "TypeDoc usage in @vercel/edge",
          href: "/blog/TypeDoc-usage-in-vercel-edge",
          items: [],
        },
        {
          title: "create-next-app validates your app name using this package",
          href: "/blog/cna-app-name-validation",
          items: [],
        },
        {
          title: "How Shadcn CLI uses error constants to improve code readability",
          href: "/blog/error-codes-in-shadcn",
          items: [],
        },
        {
          title: "buildDesignSystem fn in Tailwind CSS source code",
          href: "/blog/build-design-system-in-tailwind",
          items: [],
        },
        {
          title: "withAlpha utility in Tailwind CSS source code",
          href: "/blog/withAlpha-utility-in-Tailwind",
          items: [],
        },
        {
          title: "DefaultMap class in TailwindCSS source code",
          href: "/blog/DefaultMap-class-in-TailwindCSS",
          items: [],
        },
        {
          title: "How Tailwind CSS detects circular dependancy",
          href: "/blog/How-Tailwind-CSS-detects",
          items: [],
        },
        {
          title: "String.raw in Tailwind CSS source code",
          href: "/blog/Stringraw-in-Tailwind",
          items: [],
        },
        {
          title: "Bypass bundlers detection of the require statement",
          href: "/blog/Bypass-bundlers-detection",
          items: [],
        },
        {
          title: "MessageChannel usage in React source code",
          href: "/blog/MessageChannel-usage-in-React",
          items: [],
        },
        {
          title: "queueMacroTask in React source code",
          href: "/blog/queueMacroTask-in-React-source",
          items: [],
        },
        {
          title: "queueMicroTask in JavaScript",
          href: "/blog/queueMicroTask-in-JavaScript",
          items: [],
        },
      ],
    },
    {
      title: "September, 2024",
      items: [
        {
          title: "Object.preventExtensions in JavaScript",
          href: "/blog/ObjectpreventExtensions-in-JavaScript",
          items: [],
        },
        {
          title: "BadMapPolyfill in React Source Code",
          href: "/blog/BadMapPolyfill-in-React-Source",
          items: [],
        },
        {
          title: "FlowFixMe in React source code",
          href: "/blog/FlowFixMe-in-React-source",
          items: [],
        },
        {
          title: "text=auto in .gitattributes file",
          href: "/blog/text-auto-in-gitattributes",
          items: [],
        },
        {
          title: ".git-blame-ignore-revs to ignore bulk formatting changes",
          href: "/blog/git-blame-ignore-revs",
          items: [],
        },
        {
          title: "Stop saying - you forgot to - in code review",
          href: "/blog/Stop-saying-you-forgot-to",
          items: [],
        },
        {
          title: "Add a test case when your open-source project issue is fixed",
          href: "/blog/add-a-test-case",
          items: [],
        },
        {
          title: "useLayoutEffect in Zustand test-case explained",
          href: "/blog/useLayoutEffect-in-zustand-test",
          items: [],
        },
        {
          title: "How to override your Zustand state",
          href: "/blog/how-to-override-zustand",
          items: [],
        },
        {
          title: "Here is how test-case in Zustand uses ErrorBoundary",
          href: "/blog/Here-how-zustand-test",
          items: [],
        },
        {
          title: "ReactDOM.unstable_batchedUpdates in Zustand testcase",
          href: "/blog/ReactDOMunstablebatchedUpdates-in-zustand",
          items: [],
        },
        {
          title: "createWithEqualityFn test case in Zustand explained",
          href: "/blog/createWithEqualityFn-test-case",
          items: [],
        },
        {
          title: "createWithEqualityFnImpl in Zustand source code explained",
          href: "/blog/createWithEqualityFnImpl-in-zustand",
          items: [],
        },
        {
          title: "useDebugValue usage in Zustand source code explained",
          href: "/blog/useDebugValue-usage-in-zustand",
          items: [],
        },
        {
          title: "useBoundStoreWithEqualityFn in Zustand source code explained",
          href: "/blog/useBoundStoreWithEqualityFn-in-zustand",
          items: [],
        },
        {
          title: "useSyncExternalStoreExports in Zustand source code explained",
          href: "/blog/useSyncExternalStoreExports-in-Zustand",
          items: [],
        },
        {
          title: "createStore in Zustand source code explained",
          href: "/blog/createstore-in-zustand-source",
          items: [],
        },
        {
          title: "setState in Zustand source code",
          href: "/blog/setState-in-zustand",
          items: [],
        },
        {
          title: "Object.assign() usage in Zustand source code",
          href: "/blog/objectassign-usage-in-Zustand",
          items: [],
        },
        {
          title: "Set() usage in Zustand source code",
          href: "/blog/set-usage-in-zustand",
          items: [],
        },
        {
          title: "Object.is() usage in Zustand source code",
          href: "/blog/object-usage-in-zustand",
          items: [],
        },
      ],
    },
    {
      title: "August, 2024",
      items: [
        {
          title: "Generating a JSDoc comment for your function using OpenAI",
          href: "/blog/generating-a-jsdoc-comment",
          items: [],
        },
        {
          title: "Organize your components and layouts in your pages-based Next.js application this way",
          href: "/blog/organize-your-components",
          items: [],
        },
      ],
    },
    
  ],
}