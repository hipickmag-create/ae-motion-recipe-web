import recipeData from '../content/recipes/recipes.json' with { type: 'json' };

export type Chapter = {
  readonly number: string;
  readonly title: string;
  readonly subtitle: string;
  readonly recipes: readonly RecipeSummary[];
};

export type RecipeSummary = {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly chapter: string;
};

export type Recipe = RecipeSummary & {
  readonly summary: string;
  readonly property: string;
  readonly expression: string;
  readonly result: string;
};

export const chapters = recipeData.chapters as readonly Chapter[];
export const recipes = recipeData.recipes as readonly Recipe[];
export const recipeTotal = recipes.length;
