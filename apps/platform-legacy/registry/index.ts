import { type Registry } from "thinkthroo/registry";
import { generators } from "@/registry/registry-generators";

export const registry = {
  name: "thinkthroo",
  homepage: "https://thinkthroo.com",
  items: [...generators],
} satisfies Registry;
