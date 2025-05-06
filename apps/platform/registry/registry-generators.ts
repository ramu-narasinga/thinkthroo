import { type Registry } from "thinkthroo/registry";

export const generators: Registry["items"] = [
  {
    name: "changesets",
    type: "registry:generator",
    dependencies: [],
    devDependencies: [],
    scripts: {
      "changeset:init": "npx changeset init",
      "changeset:add": "npx changeset add",
    },
    files: [
      {
        path: ".github/workflows/npm-release.yml",
        type: "registry:file",
        target: ".github/workflows/npm-release.yml",
      },
    ],
    docs: "Changesets is configured sucessfully. Learn how Changesets is configured in OSS projects and find the next steps at https://app.thinkthroo.com/guide/cli/configure-changesets/c-configure-changesets/l-configure-changesets-introduction",
  },
];
