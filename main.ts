// Meme Sprint 3 — AI Agent Goes Rogue.
// This program does one small job: it takes the finished meme picture
// that ships with this repo and places an exact copy of it in the
// output folder, under the name the judges expect (entry.png).
// Nothing is drawn, cropped, or re-encoded here — the meme is used
// exactly as it was made.

import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The folder this file lives in is the repo root. We only ever read
// from it; every write goes to the output directory below.
const repoDir = dirname(fileURLToPath(import.meta.url));
const sourceImage = join(repoDir, "meme.png");

// The harness hands us the output folder through the environment.
// Fall back to /output so the program still behaves sensibly alone.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const entryImage = join(outDir, "entry.png");

function sha256Of(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

// Refuse to write into the repo itself: the output folder must be a
// different directory, so a mis-set env var can never overwrite the
// source picture.
if (resolve(outDir) === resolve(repoDir)) {
  throw new Error("MAKEFUN_OUTPUT_DIR must not be the repo directory");
}

// The source must be a real, non-empty picture before we copy it.
const sourceSize = statSync(sourceImage).size;
if (sourceSize === 0) {
  throw new Error("meme.png is empty, refusing to copy it");
}

// Make sure the destination exists, then copy the meme across.
mkdirSync(outDir, { recursive: true });
copyFileSync(sourceImage, entryImage);

// Prove the copy is faithful: compare both the byte length and the
// hash of the two files. If anything changed in transit, fail loudly
// instead of shipping a corrupted entry.
const sourceBytes = readFileSync(sourceImage);
const entryBytes = readFileSync(entryImage);
const sourceHash = sha256Of(sourceImage);
const entryHash = sha256Of(entryImage);
if (sourceBytes.length !== entryBytes.length || sourceHash !== entryHash) {
  throw new Error(
    `entry.png does not match meme.png (source ${sourceHash}, copy ${entryHash})`,
  );
}

console.log(
  `entry.png written to ${entryImage} (${entryBytes.length} bytes, sha256 ${entryHash})`,
);
