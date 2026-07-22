import { recipes } from './generated/recipes.js';

export { recipes };

export const chapters = [
  { number: '01', slug: 'motion-basics', title: 'Motion Basics', subtitle: '기본 움직임', description: '기본 움직임을 빠르게 만드는 핵심 표현식입니다.' },
  { number: '02', slug: 'loop-motion', title: 'Loop Motion', subtitle: '무한 반복', description: '반복, 순환, 루프 애니메이션을 만드는 표현식입니다.' },
  { number: '03', slug: 'bounce-spring', title: 'Bounce & Spring', subtitle: '탄성 · 관성', description: '바운스와 스프링 감각을 만드는 표현식입니다.' },
  { number: '04', slug: 'follow-motion', title: 'Follow Motion', subtitle: '따라가기', description: '레이어와 값을 따라가게 만드는 표현식입니다.' },
  { number: '05', slug: 'random-motion', title: 'Random Motion', subtitle: '무작위 움직임', description: '랜덤 움직임과 자연스러운 노이즈를 만드는 표현식입니다.' },
  { number: '06', slug: 'time-control', title: 'Time Control', subtitle: '시간 제어', description: '시간, 지연, 진행률을 제어하는 표현식입니다.' },
  { number: '07', slug: 'text-motion', title: 'Text Motion', subtitle: '텍스트 모션', description: '타이포그래피 애니메이션에 쓰기 좋은 표현식입니다.' },
  { number: '08', slug: 'audio-reaction', title: 'Audio Reaction', subtitle: '오디오 반응', description: '사운드에 반응하는 모션을 만드는 표현식입니다.' },
  { number: '09', slug: 'utility', title: 'Utility', subtitle: '실무 함수', description: '작업 속도를 높이는 실무 유틸리티 표현식입니다.' },
  { number: '10', slug: 'production-recipes', title: 'Production Recipes', subtitle: '실무 레시피', description: '프로덕션 상황에서 바로 조합해 쓰기 좋은 레시피입니다.' },
].map((chapter) => ({
  ...chapter,
  recipes: recipes.filter((recipe) => recipe.chapterSlug === chapter.slug).length,
}));

export const recipeTotal = recipes.length;
export const recipeBySlug = (slug) => recipes.find((recipe) => recipe.slug === slug);
export const chapterBySlug = (slug) => chapters.find((chapter) => chapter.slug === slug);
export const recipesForChapter = (slug) => recipes.filter((recipe) => recipe.chapterSlug === slug);

export function searchRecipes(query, source = recipes) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return source.filter((recipe) => [
    recipe.title,
    recipe.description,
    recipe.category,
    recipe.chapterSlug,
    ...(recipe.tags ?? []),
    ...(recipe.useCases ?? []),
  ].join(' ').toLowerCase().includes(normalizedQuery));
}
