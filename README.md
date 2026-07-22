# AE Motion Recipe

A static After Effects Expression Recipe Library for motion designers. The site presents the recipe book as a polished, copy-ready frontend with chapter navigation, a search hero, workflow guidance, and a production-focused preview.

## Static site implementation

The intended implementation is a lightweight static site:

- `index.html` contains the accessible page structure and Korean/English marketing copy.
- `styles.css` provides the responsive visual design for the hero, chapter cards, workflow cards, and preview panel.
- `recipe-book.txt` is the normalized recipe-book asset linked from the chapter cards and copied into the production build.
- `src/app.ts` keeps the chapter metadata typed and validates the recipe totals during TypeScript checks.
- `scripts/build.mjs` creates `dist/` and copies the deployable static assets.

The original uploaded text file is retained for source/reference history, while the static site consumes `recipe-book.txt`.

## Development

```bash
npm install
npm run build
```

The build validates the TypeScript source and copies `index.html`, `styles.css`, and `recipe-book.txt` into `dist/`.
