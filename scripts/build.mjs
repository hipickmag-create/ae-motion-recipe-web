import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const staticFiles = ['index.html', 'chapter.html', 'recipe.html', 'styles.css'];
const staticDirs = ['src'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await Promise.all([
  ...staticFiles.map((file) => cp(resolve(root, file), resolve(dist, file))),
  ...staticDirs.map((dir) => cp(resolve(root, dir), resolve(dist, dir), { recursive: true })),
]);

console.log(`Built ${staticFiles.length} pages to ${dist}`);
