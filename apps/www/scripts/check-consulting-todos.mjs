// Build-time warning (not a build failure) listing every unresolved
// {{TODO: ...}} placeholder left in the consulting content config, so it's
// obvious before a deploy which pages will ship noindex'd.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(dir, "..", "lib", "data", "consulting");

const TODO_RE = /\{\{TODO:[^}]*\}\}/g;

let total = 0;

for (const file of readdirSync(dataDir)) {
  if (!file.endsWith(".ts")) continue;
  const contents = readFileSync(path.join(dataDir, file), "utf8");
  const matches = contents.match(TODO_RE);
  if (!matches) continue;
  total += matches.length;
  console.warn(`\n[consulting-todos] ${file}:`);
  for (const match of new Set(matches)) {
    console.warn(`  - ${match}`);
  }
}

if (total > 0) {
  console.warn(
    `\n[consulting-todos] ${total} unresolved placeholder(s) found. Affected pages will be noindex'd until these are filled in. See TODO.md.\n`
  );
} else {
  console.log("[consulting-todos] No unresolved placeholders.");
}
