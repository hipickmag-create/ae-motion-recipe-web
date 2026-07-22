export type Chapter = {
  readonly number: string;
  readonly title: string;
  readonly subtitle: string;
  readonly recipes: number;
  readonly anchor: string;
};

export const chapters: readonly Chapter[] = [
  { number: '01', title: 'Motion Basics', subtitle: '기본 움직임', recipes: 6, anchor: 'r01' },
  { number: '02', title: 'Loop Motion', subtitle: '무한 반복', recipes: 6, anchor: 'r07' },
  { number: '03', title: 'Bounce & Spring', subtitle: '탄성 · 관성', recipes: 6, anchor: 'r13' },
  { number: '04', title: 'Follow Motion', subtitle: '따라가기', recipes: 6, anchor: 'r19' },
  { number: '05', title: 'Random Motion', subtitle: '무작위 움직임', recipes: 6, anchor: 'r25' },
  { number: '06', title: 'Time Control', subtitle: '시간 제어', recipes: 6, anchor: 'r31' },
  { number: '07', title: 'Text Motion', subtitle: '텍스트 모션', recipes: 6, anchor: 'r37' },
  { number: '08', title: 'Audio Reaction', subtitle: '오디오 반응', recipes: 6, anchor: 'r43' },
  { number: '09', title: 'Utility', subtitle: '실무 함수', recipes: 6, anchor: 'r49' },
  { number: '10', title: 'Production Recipes', subtitle: '실무 레시피', recipes: 16, anchor: 'r55' },
];

export const recipeTotal = chapters.reduce((total, chapter) => total + chapter.recipes, 0);
