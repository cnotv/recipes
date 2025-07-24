import { createI18n } from 'vue-i18n'

export interface UITranslations {
  // Header
  recipeCollection: string
  language: string
  cuisine: string
  allCuisines: string
  recipesFound: string
  
  // Filters
  english: string
  german: string
  japanese: string
  thai: string
  
  // Recipe display
  viewRecipe: string
  loading: string
  error: string
  noRecipes: string
  noRecipesAvailable: string
  
  // Language detection
  languageAutoSet: string
  languageAutoSetDescription: string
  
  // Pagination
  previousPage: string
  nextPage: string
  page: string
  of: string
  
  // Recipe detail
  ingredients: string
  instructions: string
  steps: string
  backToHome: string
}

const messages = {
  en: {
    // Header
    recipeCollection: 'Recipe Collection',
    language: 'Language:',
    cuisine: 'Cuisine:',
    allCuisines: 'All Cuisines',
    recipesFound: 'recipes found',
    
    // Filters
    english: 'English',
    german: 'Deutsch',
    japanese: '日本語',
    thai: 'ไทย',
    
    // Recipe display
    viewRecipe: 'View Recipe',
    loading: 'Loading recipes...',
    error: 'Error loading recipes',
    noRecipes: 'No recipes found',
    noRecipesAvailable: 'No recipes available in {language}.',
    
    // Language detection
    languageAutoSet: 'Language automatically set to {language} based on your region.',
    languageAutoSetDescription: 'You can change it above.',
    
    // Pagination
    previousPage: 'Previous',
    nextPage: 'Next',
    page: 'Page',
    of: 'of',
    
    // Recipe detail
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    steps: 'Steps',
    backToHome: 'Back to Recipes'
  } satisfies UITranslations,
  
  de: {
    // Header
    recipeCollection: 'Rezeptsammlung',
    language: 'Sprache:',
    cuisine: 'Küche:',
    allCuisines: 'Alle Küchen',
    recipesFound: 'Rezepte gefunden',
    
    // Filters
    english: 'English',
    german: 'Deutsch',
    japanese: '日本語',
    thai: 'ไทย',
    
    // Recipe display
    viewRecipe: 'Rezept anzeigen',
    loading: 'Rezepte werden geladen...',
    error: 'Fehler beim Laden der Rezepte',
    noRecipes: 'Keine Rezepte gefunden',
    noRecipesAvailable: 'Keine Rezepte auf {language} verfügbar.',
    
    // Language detection
    languageAutoSet: 'Sprache automatisch auf {language} basierend auf Ihrer Region eingestellt.',
    languageAutoSetDescription: 'Sie können sie oben ändern.',
    
    // Pagination
    previousPage: 'Zurück',
    nextPage: 'Weiter',
    page: 'Seite',
    of: 'von',
    
    // Recipe detail
    ingredients: 'Zutaten',
    instructions: 'Anweisungen',
    steps: 'Schritte',
    backToHome: 'Zurück zu Rezepten'
  } satisfies UITranslations,
  
  jp: {
    // Header
    recipeCollection: 'レシピコレクション',
    language: '言語:',
    cuisine: '料理:',
    allCuisines: 'すべての料理',
    recipesFound: 'レシピが見つかりました',
    
    // Filters
    english: 'English',
    german: 'Deutsch',
    japanese: '日本語',
    thai: 'ไทย',
    
    // Recipe display
    viewRecipe: 'レシピを見る',
    loading: 'レシピを読み込み中...',
    error: 'レシピの読み込みエラー',
    noRecipes: 'レシピが見つかりません',
    noRecipesAvailable: '{language}でのレシピがありません。',
    
    // Language detection
    languageAutoSet: 'お住まいの地域に基づいて言語が{language}に自動設定されました。',
    languageAutoSetDescription: '上で変更できます。',
    
    // Pagination
    previousPage: '前へ',
    nextPage: '次へ',
    page: 'ページ',
    of: 'の',
    
    // Recipe detail
    ingredients: '材料',
    instructions: '手順',
    steps: 'ステップ',
    backToHome: 'レシピ一覧に戻る'
  } satisfies UITranslations,
  
  th: {
    // Header
    recipeCollection: 'คอลเลกชันสูตรอาหาร',
    language: 'ภาษา:',
    cuisine: 'อาหาร:',
    allCuisines: 'อาหารทั้งหมด',
    recipesFound: 'สูตรที่พบ',
    
    // Filters
    english: 'English',
    german: 'Deutsch',
    japanese: '日本語',
    thai: 'ไทย',
    
    // Recipe display
    viewRecipe: 'ดูสูตร',
    loading: 'กำลังโหลดสูตรอาหาร...',
    error: 'เกิดข้อผิดพลาดในการโหลดสูตรอาหาร',
    noRecipes: 'ไม่พบสูตรอาหาร',
    noRecipesAvailable: 'ไม่มีสูตรอาหารใน{language}',
    
    // Language detection
    languageAutoSet: 'ตั้งค่าภาษาเป็น{language}โดยอัตโนมัติตามภูมิภาคของคุณ',
    languageAutoSetDescription: 'คุณสามารถเปลี่ยนได้ข้างบน',
    
    // Pagination
    previousPage: 'ก่อนหน้า',
    nextPage: 'ถัดไป',
    page: 'หน้า',
    of: 'จาก',
    
    // Recipe detail
    ingredients: 'ส่วนผสม',
    instructions: 'วิธีทำ',
    steps: 'ขั้นตอน',
    backToHome: 'กลับไปที่สูตรอาหาร'
  } satisfies UITranslations
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

export default function useI18n() {
  return i18n.global
}
