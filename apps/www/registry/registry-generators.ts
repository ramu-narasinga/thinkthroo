import { type Registry } from "thinkthroo/registry";

export const generators: Registry["items"] = [
  {
    name: "changesets",
    type: "registry:generator",
    dependencies: [],
    devDependencies: ["@changesets/cli"],
    files: [
      {
        path: ".github/workflows/npm-release.yml",
        type: "registry:file",
        target: ".github/workflows/npm-release.yml"
      },
    ],
  },
];
