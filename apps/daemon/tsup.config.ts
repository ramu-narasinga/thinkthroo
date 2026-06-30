import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  target: "node22",
  outDir: "dist",
  treeshake: true,
  banner: ({ format }) => {
    if (format === "esm") {
      return { js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);` };
    }
    return {};
  },
});
