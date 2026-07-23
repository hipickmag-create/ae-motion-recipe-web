import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const source = process.argv[2] ?? 'recipe-book.txt';
const outDir = process.argv[3] ?? 'content/recipes';
const text = await readFile(source, 'utf8');
const lines = text.split(/\r?\n/);
const chapters = [];
const recipeRows = new Map();
let currentChapter = null;
for (const line of lines) {
  const chapter = line.match(/^### CHAPTER (\d+)\.\s*(.+?)\s+—\s+(.+)$/);
  if (chapter) {
    currentChapter = { number: chapter[1], title: chapter[2].trim(), subtitle: chapter[3].trim(), recipes: [] };
    chapters.push(currentChapter);
    continue;
  }
  const row = line.match(/^\| #(\d+) \| ([^|]+) \| ([^|]+) \| \[바로가기\]\(#r\d+\) \|$/);
  if (row && currentChapter) {
    const item = { id: `r${row[1].padStart(2, '0')}`, number: row[1].padStart(2, '0'), title: row[2].trim(), description: row[3].trim(), chapter: currentChapter.number };
    currentChapter.recipes.push(item);
    recipeRows.set(item.id, item);
  }
}
const sections = text.split(/\n(?=<a id="r\d+"><\/a>)/).slice(1);
const recipes = sections.map((section) => {
  const id = section.match(/<a id="(r\d+)"><\/a>/)?.[1];
  const heading = section.match(/### #(\d+)\.\s*(.+?)(?:\s+—\s+(.+))?\n/);
  if (!id || !heading) return null;
  const getBlock = (label) => section.match(new RegExp(`\\*\\*${label}\\*\\*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n---|$)`))?.[1].trim() ?? '';
  const expression = getBlock('Expression').match(/```\n([\s\S]*?)\n```/)?.[1] ?? '';
  const meta = recipeRows.get(id);
  return {
    id,
    number: heading[1].padStart(2, '0'),
    title: heading[2].trim(),
    summary: (heading[3] ?? meta?.description ?? '').trim(),
    description: getBlock('한 줄 설명'),
    property: getBlock('적용 속성'),
    expression,
    controls: getBlock('조절 가능한 값'),
    result: getBlock('결과'),
    examples: getBlock('활용 예시'),
    cautions: getBlock('주의사항'),
    tip: getBlock('초보 TIP'),
    pairs: getBlock('함께 쓰면 좋은 레시피'),
    chapter: meta?.chapter ?? '',
  };
}).filter(Boolean);
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'recipes.json'), JSON.stringify({ source: basename(source), chapters, recipes }, null, 2));
console.log(`Parsed ${recipes.length} recipes from ${source}`);
