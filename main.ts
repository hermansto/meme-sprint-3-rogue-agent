import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The meme image lives next to this file in the repo; copy it into the
// harness output directory as entry.png, byte-for-byte, nothing else.
const repoDir = dirname(fileURLToPath(import.meta.url));
const source = join(repoDir, "meme.png");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
if (outDir === repoDir) {
  throw new Error("output directory must not be the repo directory");
}
const target = join(outDir, "entry.png");

if (!existsSync(source)) {
  throw new Error(`meme.png not found next to main.ts (${source})`);
}
const size = statSync(source).size;
if (size === 0) {
  throw new Error("meme.png is empty");
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

// Hash both files and compare, so a truncated copy is caught here.
const digest = (path: string) =>
  createHash("sha256").update(require("node:fs").readFileSync(path)).digest("hex");
if (digest(source) !== digest(target)) {
  throw new Error("entry.png does not match meme.png");
}
console.log(`Copied ${size} bytes to ${target}`);
