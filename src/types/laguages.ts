export const languages = ['es', 'en', 'fr', 'ja', 'zh'] as const;

export type Language = (typeof languages)[number];

export const languageNames: Record<Language, string> = {
  es: 'Spanish',
  en: 'English',
  fr: 'French',
  ja: 'Japanese',
  zh: 'Chinese',
};
