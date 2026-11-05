export interface RecipeStep {
  image: string;
  content: string;
}

export interface RecipeLanguage {
  title: string;
  description?: string;
  ingredients: string[];
  steps: RecipeStep[];
}

export interface Recipe {
  slug?: string;
  url: string;
  cuisine: string;
  cover?: string;  // Optional cover image URL
  createdAt?: string;
  _totalIngredientCount?: number; // For preview mode with limited ingredient data
  languages: {
    en?: RecipeLanguage;
    de?: RecipeLanguage;
    jp?: RecipeLanguage;
    th?: RecipeLanguage;
    [key: string]: RecipeLanguage | undefined;
  };
}

export type SupportedLanguage = 'en' | 'de' | 'jp' | 'th';
