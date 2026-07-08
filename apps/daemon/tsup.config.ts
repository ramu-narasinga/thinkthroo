import { defineConfig } from "tsup";

try {
  // Populates process.env from apps/daemon/.env (gitignored, dev-machine/CI
  // only) so VERCEL_PROTECTION_BYPASS below has a value to inline.
  process.loadEnvFile();
} catch {
  // No .env present — fine in CI where the var is injected directly.
}

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  target: "node22",
  outDir: "dist",
  treeshake: true,
  env: {
    VERCEL_PROTECTION_BYPASS: process.env.VERCEL_PROTECTION_BYPASS ?? "",
  },
  banner: ({ format }) => {
    if (format === "esm") {
      return { js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);` };
    }
    return {};
  },
});
