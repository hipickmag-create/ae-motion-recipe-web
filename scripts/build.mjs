import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const recipesDir = resolve(dist, 'recipes');
const staticFiles = ['index.html', 'styles.css', 'recipe-book.txt'];
const data = JSON.parse(await readFile(resolve(root, 'content/recipes/recipes.json'), 'utf8'));
const esc = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = (recipe) => `${recipe.number}-${recipe.title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '')}`;
const layout = (title, body, prefix = '') => `<!doctype html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${esc(title)} — AE Motion Recipe</title><meta name="description" content="After Effects expression recipe detail."/><link rel="stylesheet" href="${prefix}styles.css"/></head><body><header class="site-header"><nav class="nav" aria-label="Primary navigation"><a class="brand" href="${prefix}index.html"><span class="brand-mark">AE</span><span>Motion Recipe</span></a><div class="nav-links"><a href="${prefix}chapter.html">Chapters</a><a href="${prefix}recipe-book.txt">Raw Book</a></div></nav></header><main>${body}</main></body></html>`;

await rm(dist, { recursive: true, force: true });
await mkdir(recipesDir, { recursive: true });
await Promise.all(staticFiles.map((file) => cp(resolve(root, file), resolve(dist, file))));
await cp(resolve(root, 'content'), resolve(dist, 'content'), { recursive: true });

const chapterCards = data.chapters.map((chapter) => `<section class="chapter-section" id="chapter-${chapter.number}"><div class="section-heading"><p class="eyebrow">Chapter ${chapter.number}</p><h2>${esc(chapter.title)}</h2><p>${esc(chapter.subtitle)}</p></div><div class="recipe-list">${chapter.recipes.map((item) => { const recipe = data.recipes.find((entry) => entry.id === item.id); return `<a class="recipe-row" href="recipes/${slug(recipe)}.html"><span>#${item.number}</span><strong>${esc(item.title)}</strong><em>${esc(item.description)}</em></a>`; }).join('')}</div></section>`).join('');
await writeFile(resolve(dist, 'chapter.html'), layout('Chapters', `<section class="hero compact"><div class="hero-copy"><p class="eyebrow">Recipe Index</p><h1>챕터별 익스프레션 레시피</h1><p class="hero-description">${data.recipes.length}개 레시피를 목적별로 탐색하고 상세 페이지에서 바로 복사하세요.</p></div></section>${chapterCards}`));

await Promise.all(data.recipes.map((recipe) => writeFile(resolve(recipesDir, `${slug(recipe)}.html`), layout(recipe.title, `<article class="recipe-detail"><a class="back-link" href="../chapter.html">← Back to chapters</a><p class="eyebrow">Recipe #${recipe.number}</p><h1>${esc(recipe.title)}</h1><p class="hero-description">${esc(recipe.description || recipe.summary)}</p><dl class="recipe-meta"><div><dt>적용 속성</dt><dd>${esc(recipe.property)}</dd></div><div><dt>결과</dt><dd>${esc(recipe.result)}</dd></div></dl><h2>Expression</h2><pre><code>${esc(recipe.expression)}</code></pre><h2>조절 가능한 값</h2><div class="markdown-block">${esc(recipe.controls)}</div><h2>활용 예시</h2><p>${esc(recipe.examples)}</p><h2>주의사항</h2><p>${esc(recipe.cautions)}</p><h2>초보 TIP</h2><p>${esc(recipe.tip)}</p><h2>함께 쓰면 좋은 레시피</h2><p>${esc(recipe.pairs)}</p></article>`, '../'))));

console.log(`Built ${staticFiles.length} static files, chapter index, and ${data.recipes.length} recipe pages to ${dist}`);
