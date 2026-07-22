import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const recipesDir = resolve(root, 'content', 'recipes');
const outputFile = resolve(root, 'src', 'generated', 'recipes.js');
const defaultUpdated = '2026.07.22';

const chapterRanges = [
  { from: 1, to: 6, chapterSlug: 'motion-basics', category: 'Motion' },
  { from: 7, to: 12, chapterSlug: 'loop-motion', category: 'Loop' },
  { from: 13, to: 18, chapterSlug: 'bounce-spring', category: 'Bounce' },
  { from: 19, to: 24, chapterSlug: 'follow-motion', category: 'Motion' },
  { from: 25, to: 30, chapterSlug: 'random-motion', category: 'Effects' },
  { from: 31, to: 36, chapterSlug: 'time-control', category: 'Motion' },
  { from: 37, to: 42, chapterSlug: 'text-motion', category: 'Text' },
  { from: 43, to: 48, chapterSlug: 'audio-reaction', category: 'Effects' },
  { from: 49, to: 54, chapterSlug: 'utility', category: 'Effects' },
  { from: 55, to: 71, chapterSlug: 'production-recipes', category: 'Motion' },
];

function requiredValue(fields, key, file) {
  const value = fields.get(key)?.trim();
  if (!value) throw new Error(`${file}: Missing required field "${key}"`);
  return value;
}

function parseRecipeText(text, file) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const fields = new Map();
  const sections = new Map();
  let activeSection = null;
  let inExpression = false;
  let expressionLines = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const keyValue = line.match(/^([A-Za-z][A-Za-z ]*):\s*(.*)$/);

    if (inExpression) {
      if (line.trim() === '```') {
        inExpression = false;
        sections.set('Expression', expressionLines.join('\n').trim());
        expressionLines = [];
      } else {
        expressionLines.push(rawLine);
      }
      continue;
    }

    if (activeSection === 'Expression' && line.startsWith('```')) {
      inExpression = true;
      continue;
    }

    if (keyValue) {
      const [, key, value] = keyValue;
      activeSection = key;
      if (value) fields.set(key, value);
      if (!value && !sections.has(key)) sections.set(key, []);
      continue;
    }

    if (!activeSection || line.trim() === '') continue;
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem) {
      const list = sections.get(activeSection) ?? [];
      list.push(listItem[1].trim());
      sections.set(activeSection, list);
      continue;
    }

    if (activeSection !== 'Expression') {
      const previous = sections.get(activeSection);
      if (Array.isArray(previous)) previous.push(line.trim());
      else sections.set(activeSection, [line.trim()]);
    }
  }

  if (inExpression) throw new Error(`${file}: Unclosed Expression code block`);

  return { fields, sections };
}

function cleanList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function requiredListSection(sections, key, file) {
  const value = cleanList(sections.get(key));
  if (value.length === 0) throw new Error(`${file}: Missing required section "${key}"`);
  return value;
}

function requiredTextSection(sections, key, file) {
  const value = cleanList(sections.get(key)).join('\n').trim();
  if (!value) throw new Error(`${file}: Missing required section "${key}"`);
  return value;
}

function parseControls(items) {
  return cleanList(items).map((item) => {
    const [name = '', meaning = '', recommendation = ''] = item.split('|').map((part) => part.trim());
    return { name, meaning, recommendation };
  });
}

function chapterFor(number) {
  return chapterRanges.find((range) => number >= range.from && number <= range.to) ?? chapterRanges[0];
}

function difficultyFor(number) {
  if (number <= 20) return 'Beginner';
  if (number <= 50) return 'Intermediate';
  return 'Advanced';
}

function timeFor(difficulty) {
  if (difficulty === 'Advanced') return '15 min';
  if (difficulty === 'Intermediate') return '7 min';
  return '2 min';
}

async function previewFor(number) {
  const gifName = `${number}.gif`;
  const candidates = [
    resolve(root, 'content', 'preview', gifName),
    resolve(root, 'preview', gifName),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate, constants.F_OK);
      return `/preview/${gifName}`;
    } catch {
      // Missing previews are expected; keep looking and fall back to null.
    }
  }

  return null;
}

function stripEmoji(value) {
  return value
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagsFor({ property, category, useCases }) {
  const propertyLeaf = property.split('→').pop()?.trim() ?? property;
  return [...new Set([category, propertyLeaf, ...useCases.map(stripEmoji)].filter(Boolean))];
}

function summaryFor({ title, property, difficulty }) {
  const propertyLeaf = property.split('→').pop()?.trim() ?? property;
  return [
    { icon: '🎯', text: `Apply to ${propertyLeaf}` },
    { icon: '⚙️', text: `${title} controls` },
    { icon: difficulty === 'Advanced' ? '🔴' : difficulty === 'Intermediate' ? '🟡' : '🟢', text: `${difficulty} friendly` },
  ];
}

async function main() {
  const files = (await readdir(recipesDir))
    .filter((file) => /^\d{3}\.txt$/.test(file))
    .sort((a, b) => a.localeCompare(b));

  const parsed = [];
  const slugFiles = new Map();
  for (const file of files) {
    const id = basename(file, '.txt');
    const number = Number.parseInt(id, 10);
    const source = await readFile(resolve(recipesDir, file), 'utf8');
    const { fields, sections } = parseRecipeText(source, file);
    const title = requiredValue(fields, 'Title', file);
    const description = requiredValue(fields, 'Description', file);
    const property = requiredValue(fields, 'Property', file);
    const slug = requiredValue(fields, 'Slug', file);
    const existingSlugFile = slugFiles.get(slug);
    if (existingSlugFile) {
      throw new Error(`Duplicate slug "${slug}"\n\nFirst defined in:\n${existingSlugFile}\n\nDuplicate found in:\n${file}`);
    }
    slugFiles.set(slug, file);
    const useCases = requiredListSection(sections, 'Use Cases', file);
    const expression = sections.get('Expression')?.trim();
    if (!expression) throw new Error(`${file}: Missing required section "Expression"`);
    const controls = parseControls(requiredListSection(sections, 'Controls', file));
    const result = requiredTextSection(sections, 'Result', file);
    const cautions = requiredListSection(sections, 'Cautions', file);
    const tips = requiredListSection(sections, 'Tips', file);
    const relatedNumbers = cleanList(sections.get('Related'));
    const chapter = chapterFor(number);
    const difficulty = difficultyFor(number);

    parsed.push({
      // Generated fields
      id,
      number,
      chapterSlug: chapter.chapterSlug,
      difficulty,
      badge: null,
      time: timeFor(difficulty),
      updated: defaultUpdated,
      category: chapter.category,
      compatible: 'After Effects',
      preview: await previewFor(id),
      summary: summaryFor({ title, property, difficulty }),
      tags: tagsFor({ property, category: chapter.category, useCases }),

      // Authored fields
      slug,
      title,
      description,
      property,
      useCases,
      expression,
      controls,
      result,
      cautions,
      tips,

      // Parser-only fields, removed before output
      sourceFile: file,
      relatedNumbers,
    });
  }

  const slugById = new Map(parsed.map((recipe) => [recipe.id, recipe.slug]));
  const recipes = parsed.map(({ sourceFile, relatedNumbers, ...recipe }) => {
    const related = relatedNumbers.map((relatedNumber) => {
      const relatedSlug = slugById.get(relatedNumber);
      if (!relatedSlug) {
        throw new Error(`${sourceFile}: Related recipe "${relatedNumber}" does not exist.`);
      }
      return relatedSlug;
    });

    return {
      ...recipe,
      related,
    };
  });

  const output = `// This file is generated by scripts/parse-recipes.mjs. Do not edit manually.\n\nexport const recipes = ${JSON.stringify(recipes, null, 2)};\n`;
  await writeFile(outputFile, output);
  console.log(`Generated ${recipes.length} recipes to ${outputFile}`);
}

await main();
