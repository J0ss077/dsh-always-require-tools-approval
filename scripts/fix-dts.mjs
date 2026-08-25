/**
 * Rewrite relative `.ts` specifiers to `.js` in the emitted `lib/*.d.ts`.
 *
 * `rewriteRelativeImportExtensions` rewrites the JavaScript output but leaves
 * declaration files untouched, so a published `lib/*.d.ts` would otherwise
 * reference `./contracts.ts` (a file that never ships). Declaration files must
 * reference the shipped `./contracts.js` so a consumer's TypeScript resolves
 * them through the standard `.js` → `.d.ts` mapping.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const libDir = join(dirname(fileURLToPath(import.meta.url)), "..", "lib");

for (const file of readdirSync(libDir)) {
    if (!file.endsWith(".d.ts")) continue;
    const path = join(libDir, file);
    const source = readFileSync(path, "utf8");
    const fixed = source.replace(/(\.\.?\/[^"']*?)\.ts(["'])/g, "$1.js$2");
    if (fixed !== source) writeFileSync(path, fixed);
}
