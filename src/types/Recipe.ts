export interface RecipeStep {
  image: string;
  content: string;
}

export interface RecipeLanguage {
  title: string;
  ingredients: string[];
  steps: RecipeStep[];
}

export interface Recipe {
  url: string;
  languages: {
    en?: RecipeLanguage;
    de?: RecipeLanguage;
    jp?: RecipeLanguage;
    th?: RecipeLanguage;
    [key: string]: RecipeLanguage | undefined;
  };
}

export type SupportedLanguage = 'en' | 'de' | 'jp' | 'th';
