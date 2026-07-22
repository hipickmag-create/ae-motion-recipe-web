import { chapters, recipeTotal, recipes, searchRecipes, chapterBySlug, recipeBySlug, recipesForChapter } from './library.js';

const page = document.body.dataset.page;
const params = new URLSearchParams(window.location.search);
const recipeUrl = (recipe) => `recipe.html?recipe=${recipe.slug}`;
const chapterUrl = (chapter) => `chapter.html?chapter=${chapter.slug}`;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

function metaBadges(recipe) {
  return [
    recipe.difficulty,
    recipe.badge,
    recipe.time,
    recipe.category,
    ...(recipe.tags ?? []).slice(0, 3),
  ].filter(Boolean).map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join('');
}

function recipeCard(recipe, className = 'recipe-list-card') {
  return `<a class="${className}" href="${recipeUrl(recipe)}"><span><strong>${escapeHtml(recipe.title)}</strong><p>${escapeHtml(recipe.description)}</p><span class="meta-row">${metaBadges(recipe)}</span></span><span class="arrow">→</span></a>`;
}

function renderSearch(form) {
  const input = form.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const matches = searchRecipes(input.value);
    if (matches[0]) window.location.href = recipeUrl(matches[0]);
  });

  input.addEventListener('input', () => {
    const query = input.value.trim();
    if (!query) {
      results.hidden = true;
      results.innerHTML = '';
      return;
    }

    const matches = searchRecipes(query).slice(0, 6);
    results.hidden = false;
    results.innerHTML = matches.length
      ? matches.map((recipe) => recipeCard(recipe, 'result-card')).join('')
      : '<div class="empty-state"><strong>검색 결과가 없습니다.</strong><p>Wiggle, Bounce, Loop, Text 같은 키워드로 검색해보세요.</p></div>';
  });
}

function renderHome() {
  document.querySelectorAll('[data-recipe-total]').forEach((node) => { node.textContent = String(recipeTotal); });
  document.querySelector('[data-recipe-total-label]').textContent = `${recipeTotal} Recipes`;
  document.querySelector('[data-chapter-total]').textContent = `${chapters.length} Chapters`;

  const featured = recipeBySlug('elastic-pop-in') ?? recipes[0];
  document.querySelector('[data-featured-recipe]').innerHTML = `<div class="card-window-bar"><span></span><span></span><span></span></div><div class="recipe-preview-header"><p>Featured Recipe</p><strong>${escapeHtml(featured.title)}</strong></div><pre><code>${escapeHtml(featured.expression)}</code></pre>`;

  document.querySelector('[data-chapter-grid]').innerHTML = chapters.map((chapter, index) => `<a class="chapter-card ${index === chapters.length - 1 ? 'featured' : ''}" href="${chapterUrl(chapter)}"><span class="chapter-number">${chapter.number}</span><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.subtitle)}</p><strong>${chapter.recipes} Recipes</strong><span class="arrow">→</span></a>`).join('');
  renderSearch(document.querySelector('[data-search-form]'));
}

function renderChapter() {
  const slug = params.get('chapter') ?? chapters[0].slug;
  const chapter = chapterBySlug(slug);
  const root = document.querySelector('[data-chapter-page]');
  if (!chapter) {
    root.innerHTML = '<div class="empty-state">Chapter not found.</div>';
    return;
  }

  const chapterRecipes = recipesForChapter(chapter.slug);
  root.innerHTML = `<div class="chapter-hero"><p class="eyebrow">Recipe Chapter</p><h1>${escapeHtml(chapter.title)}</h1><p class="hero-description">${escapeHtml(chapter.description)}</p><div class="hero-meta"><span>${chapter.recipes} Recipes</span><span>${escapeHtml(chapter.subtitle)}</span></div><form class="search-panel" role="search" data-search-form><label class="sr-only" for="chapter-search">챕터 검색</label><span class="search-icon">⌘</span><input id="chapter-search" type="search" placeholder="Search this chapter…" data-search-input /><button type="submit">Search</button></form><div class="search-results" data-search-results hidden></div></div><div class="recipe-list">${chapterRecipes.map((recipe) => recipeCard(recipe)).join('')}</div>`;

  const form = root.querySelector('[data-search-form]');
  const input = form.querySelector('[data-search-input]');
  const results = root.querySelector('[data-search-results]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const first = searchRecipes(input.value, chapterRecipes)[0];
    if (first) window.location.href = recipeUrl(first);
  });
  input.addEventListener('input', () => {
    const matches = searchRecipes(input.value, chapterRecipes);
    results.hidden = !input.value.trim();
    results.innerHTML = matches.length ? matches.map((recipe) => recipeCard(recipe, 'result-card')).join('') : '<div class="empty-state">검색 결과가 없습니다.</div>';
  });
}

function renderRecipe() {
  const slug = params.get('recipe') ?? recipes[0].slug;
  const recipe = recipeBySlug(slug);
  const root = document.querySelector('[data-recipe-page]');
  if (!recipe) {
    root.innerHTML = '<div class="empty-state">Recipe not found.</div>';
    return;
  }

  const index = recipes.findIndex((item) => item.slug === recipe.slug);
  const related = (recipe.related ?? []).map(recipeBySlug).filter(Boolean).slice(0, 4);
  const chapter = chapterBySlug(recipe.chapterSlug);
  root.innerHTML = `<article class="recipe-layout"><header class="recipe-hero"><p class="eyebrow">Recipe Detail</p><h1>${escapeHtml(recipe.title)}</h1><p class="hero-description">${escapeHtml(recipe.description)}</p><div class="meta-row">${metaBadges(recipe)}<span class="badge">Last Updated ${escapeHtml(recipe.updated)}</span><span class="badge">Compatible ${escapeHtml(recipe.compatible)}</span></div></header><section class="doc-panel"><h2>Description</h2><p>${escapeHtml(recipe.result || recipe.description)}</p><div class="pill-list">${(recipe.useCases ?? []).map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join('')}</div></section><section class="doc-panel"><h2>Expression</h2><pre><code>${escapeHtml(recipe.expression)}</code></pre><button class="copy-button" type="button" data-copy>Copy Expression</button></section><section class="doc-panel"><h2>Tips</h2><ul>${(recipe.tips ?? []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul><h3>Cautions</h3><ul>${(recipe.cautions ?? []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul></section><section class="doc-panel"><h2>Related Recipes</h2><div class="related-grid">${related.length ? related.map((item) => recipeCard(item, 'related-card')).join('') : '<div class="empty-state">관련 레시피가 아직 없습니다.</div>'}</div></section><nav class="nav-pager" aria-label="Previous and next recipes">${recipes[index - 1] ? `<a href="${recipeUrl(recipes[index - 1])}">← ${escapeHtml(recipes[index - 1].title)}</a>` : '<span></span>'}${recipes[index + 1] ? `<a href="${recipeUrl(recipes[index + 1])}">${escapeHtml(recipes[index + 1].title)} →</a>` : '<span></span>'}</nav></article>`;
  document.title = `${recipe.title} — ${chapter?.title ?? 'AE Motion Recipe'}`;
  root.querySelector('[data-copy]').addEventListener('click', async (event) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(recipe.expression);
      event.currentTarget.textContent = '✓ Copied to Clipboard';
      event.currentTarget.classList.add('copied');
    } catch {
      event.currentTarget.textContent = 'Copy failed';
    }
  });
}

if (page === 'home') renderHome();
if (page === 'chapter') renderChapter();
if (page === 'recipe') renderRecipe();
