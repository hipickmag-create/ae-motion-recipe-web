import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const staticFiles = ['index.html', 'styles.css', 'recipe-book.txt'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await Promise.all(
  staticFiles.map((file) => cp(resolve(root, file), resolve(dist, file))),
);

console.log(`Built ${staticFiles.length} files to ${dist}`);
