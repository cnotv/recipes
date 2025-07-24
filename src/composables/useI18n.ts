import { createI18n } from 'vue-i18n'

export interface UITranslations {
  // Header
  recipeCollection: string
  language: string
  cuisine: string
  theme: string
  allCuisines: string
  recipesFound: string
  
  // Theme names
  blueKawaii: string
  pinkKawaii: string
  darkMode: string
  nature: string
  
  // Filters
  english: string
  german: string
  japanese: string
  thai: string
  
  // Recipe display
  viewRecipe: string
  loading: string
  loadingMore: string
  allRecipesLoaded: string
  error: string
  noRecipes: string
  noRecipesAvailable: string
  more: string
  
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
    theme: 'Theme:',
    allCuisines: 'All Cuisines',
    recipesFound: 'recipes found',
    
    // Theme names
    blueKawaii: 'Blue Kawaii',
    pinkKawaii: 'Pink Kawaii',
    darkMode: 'Dark Mode',
    nature: 'Nature',
    
    // Filters
    english: 'English',
    german: 'German',
    japanese: 'Japanese',
    thai: 'Thai',
    
    // Recipe display
    viewRecipe: 'View Recipe',
    loading: 'Loading recipes...',
    loadingMore: 'Loading more recipes',
    allRecipesLoaded: 'All recipes loaded',
    error: 'Error loading recipes',
    noRecipes: 'No recipes available',
    noRecipesAvailable: 'No recipes available in {language}',
    more: 'more',
    
    // Language detection
    languageAutoSet: 'Language automatically set to {language}',
    languageAutoSetDescription: 'Click to dismiss',
    
    // Pagination
    previousPage: 'Previous',
    nextPage: 'Next',
    page: 'Page',
    of: 'of',
    
    // Recipe detail
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    steps: 'Steps',
    backToHome: 'Back to Home'
  } satisfies UITranslations,
  
  de: {
    // Header
    recipeCollection: 'Rezeptsammlung',
    language: 'Sprache:',
    cuisine: 'Küche:',
    theme: 'Design:',
    allCuisines: 'Alle Küchen',
    recipesFound: 'Rezepte gefunden',
    
    // Theme names
    blueKawaii: 'Blaues Kawaii',
    pinkKawaii: 'Rosa Kawaii',
    darkMode: 'Dunkler Modus',
    nature: 'Natur',
    
    // Filters
    english: '🇬🇧 English',
    german: '🇩🇪 Deutsch',
    japanese: '🇯🇵 日本語',
    thai: '🇹🇭 ไทย',
    
    // Recipe display
    viewRecipe: 'Rezept ansehen',
    loading: 'Rezepte werden geladen...',
    loadingMore: 'Weitere Rezepte werden geladen',
    allRecipesLoaded: 'Alle Rezepte geladen',
    error: 'Fehler beim Laden der Rezepte',
    noRecipes: 'Keine Rezepte verfügbar',
    noRecipesAvailable: 'Keine Rezepte in {language} verfügbar',
    more: 'weitere',
    
    // Language detection
    languageAutoSet: 'Sprache automatisch auf {language} gesetzt',
    languageAutoSetDescription: 'Klicken zum Schließen',
    
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
    theme: 'テーマ:',
    allCuisines: 'すべての料理',
    recipesFound: 'レシピが見つかりました',
    
    // Theme names
    blueKawaii: 'ブルーかわいい',
    pinkKawaii: 'ピンクかわいい',
    darkMode: 'ダークモード',
    nature: '自然',
    
    // Filters
    english: '🇬🇧 English',
    german: '🇩🇪 Deutsch',
    japanese: '🇯🇵 日本語',
    thai: '🇹🇭 ไทย',
    
    // Recipe display
    viewRecipe: 'レシピを見る',
    loading: 'レシピを読み込み中...',
    loadingMore: 'さらにレシピを読み込み中',
    allRecipesLoaded: 'すべてのレシピを読み込みました',
    error: 'レシピの読み込みエラー',
    noRecipes: 'レシピが見つかりません',
    noRecipesAvailable: '{language}でのレシピがありません。',
    more: 'その他',
    
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
    cuisine: 'ประเภทอาหาร:',
    theme: 'ธีม:',
    allCuisines: 'อาหารทุกประเภท',
    recipesFound: 'สูตรอาหารที่พบ',
    
    // Theme names
    blueKawaii: 'คาวาอิสีน้ำเงิน',
    pinkKawaii: 'คาวาอิสีชมพู',
    darkMode: 'โหมดมืด',
    nature: 'ธรรมชาติ',
    
    // Filters
    english: '🇬🇧 English',
    german: '🇩🇪 Deutsch',
    japanese: '🇯🇵 日本語',
    thai: '🇹🇭 ไทย',
    
    // Recipe display
    viewRecipe: 'ดูสูตรอาหาร',
    loading: 'กำลังโหลดสูตรอาหาร...',
    loadingMore: 'กำลังโหลดสูตรอาหารเพิ่มเติม',
    allRecipesLoaded: 'โหลดสูตรอาหารทั้งหมดแล้ว',
    error: 'เกิดข้อผิดพลาดในการโหลดสูตรอาหาร',
    noRecipes: 'ไม่มีสูตรอาหารให้ดู',
    noRecipesAvailable: 'ไม่มีสูตรอาหารใน{language}',
    more: 'เพิ่มเติม',
    
    // Language detection
    languageAutoSet: 'ตั้งค่าภาษาเป็น {language} โดยอัตโนมัติ',
    languageAutoSetDescription: 'คลิกเพื่อปิด',
    
    // Pagination
    previousPage: 'ก่อนหน้า',
    nextPage: 'ถัดไป',
    page: 'หน้า',
    of: 'จาก',
    
    // Recipe detail
    ingredients: 'ส่วนผสม',
    instructions: 'วิธีทำ',
    steps: 'ขั้นตอน',
    backToHome: 'กลับสู่หน้าหลัก'
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
