import { createI18n } from 'vue-i18n'

export interface UITranslations {
  // Header
  recipeCollection: string
  language: string
  cuisine: string
  theme: string
  allCuisines: string
  recipesFound: string
  
  home: string
  navVote: string
  navSubmit: string
  skipToContent: string
  light: string
  dark: string
  system: string
  minutes: string
  close: string
  retry: string
  footerNote: string
  notFoundTitle: string
  notFoundDescription: string
  offlineTitle: string
  offlineDescription: string
  statusOnline: string
  statusOffline: string
  retryConnection: string
  connected: string
  offlineBanner: string
  updateAvailable: string
  update: string
  installPrompt: string
  install: string
  recipeNotFound: string
  
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
  viewOriginalRecipe: string
  step: string
  
  // Daily voting system
  dailyVote: {
    title: string
  }
}

const messages = {
  en: {
    // Header
    recipeCollection: 'Recipe Collection',
    language: 'Language',
    cuisine: 'Cuisine',
    theme: 'Theme',
    allCuisines: 'All Cuisines',
    recipesFound: 'recipes found',
    
    home: 'Home',
    navVote: 'Vote',
    navSubmit: 'Submit a recipe',
    skipToContent: 'Skip to content',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    minutes: 'min',
    close: 'Close',
    retry: 'Try again',
    footerNote: 'Recipes from around the world in English, German, Japanese and Thai.',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'This page does not exist or has moved.',
    offlineTitle: 'You\'re Offline',
    offlineDescription: 'You can still browse recipes you opened before. New recipes arrive when you are back online.',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    retryConnection: 'Retry connection',
    connected: 'Connected',
    offlineBanner: 'You\'re offline, showing saved content',
    updateAvailable: 'A new version is available',
    update: 'Update',
    installPrompt: 'Install Recipe Collection as an app',
    install: 'Install',
    recipeNotFound: 'Recipe not found',
    
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
    backToHome: 'Back to Home',
    viewOriginalRecipe: 'View Original Recipe',
    step: 'Step',
    
    // Daily voting system
    dailyVote: {
      title: 'Daily Recipe Vote'
    }
  } satisfies UITranslations,
  
  de: {
    // Header
    recipeCollection: 'Rezeptsammlung',
    language: 'Sprache',
    cuisine: 'Küche',
    theme: 'Design',
    allCuisines: 'Alle Küchen',
    recipesFound: 'Rezepte gefunden',
    
    home: 'Start',
    navVote: 'Abstimmen',
    navSubmit: 'Rezept einreichen',
    skipToContent: 'Zum Inhalt springen',
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System',
    minutes: 'Min.',
    close: 'Schließen',
    retry: 'Erneut versuchen',
    footerNote: 'Rezepte aus aller Welt auf Englisch, Deutsch, Japanisch und Thai.',
    notFoundTitle: 'Seite nicht gefunden',
    notFoundDescription: 'Diese Seite gibt es nicht oder sie ist umgezogen.',
    offlineTitle: 'Du bist offline',
    offlineDescription: 'Bereits geöffnete Rezepte kannst du weiter ansehen. Neue Rezepte kommen, sobald du wieder online bist.',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    retryConnection: 'Verbindung erneut prüfen',
    connected: 'Verbunden',
    offlineBanner: 'Du bist offline, gespeicherte Inhalte werden gezeigt',
    updateAvailable: 'Eine neue Version ist verfügbar',
    update: 'Aktualisieren',
    installPrompt: 'Rezeptsammlung als App installieren',
    install: 'Installieren',
    recipeNotFound: 'Rezept nicht gefunden',
    
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
    backToHome: 'Zurück zu Rezepten',
    viewOriginalRecipe: 'Originalrezept ansehen',
    step: 'Schritt',
    
    // Daily voting system
    dailyVote: {
      title: 'Tägliche Rezept-Abstimmung'
    }
  } satisfies UITranslations,
  
  jp: {
    // Header
    recipeCollection: 'レシピコレクション',
    language: '言語',
    cuisine: '料理',
    theme: 'テーマ',
    allCuisines: 'すべての料理',
    recipesFound: 'レシピが見つかりました',
    
    home: 'ホーム',
    navVote: '投票',
    navSubmit: 'レシピを投稿',
    skipToContent: '本文へ移動',
    light: 'ライト',
    dark: 'ダーク',
    system: 'システム',
    minutes: '分',
    close: '閉じる',
    retry: '再試行',
    footerNote: '世界のレシピを英語、ドイツ語、日本語、タイ語で。',
    notFoundTitle: 'ページが見つかりません',
    notFoundDescription: 'このページは存在しないか、移動しました。',
    offlineTitle: 'オフラインです',
    offlineDescription: '以前に開いたレシピは引き続き見られます。新しいレシピはオンラインに戻ると届きます。',
    statusOnline: 'オンライン',
    statusOffline: 'オフライン',
    retryConnection: '接続を再確認',
    connected: '接続しました',
    offlineBanner: 'オフラインです。保存済みの内容を表示しています',
    updateAvailable: '新しいバージョンがあります',
    update: '更新',
    installPrompt: 'レシピ集をアプリとしてインストール',
    install: 'インストール',
    recipeNotFound: 'レシピが見つかりません',
    
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
    backToHome: 'レシピ一覧に戻る',
    viewOriginalRecipe: '元のレシピを見る',
    step: 'ステップ',
    
    // Daily voting system
    dailyVote: {
      title: '今日のレシピ投票'
    }
  } satisfies UITranslations,
  
  th: {
    // Header
    recipeCollection: 'คอลเลกชันสูตรอาหาร',
    language: 'ภาษา',
    cuisine: 'ประเภทอาหาร',
    theme: 'ธีม',
    allCuisines: 'อาหารทุกประเภท',
    recipesFound: 'สูตรอาหารที่พบ',
    
    home: 'หน้าหลัก',
    navVote: 'โหวต',
    navSubmit: 'ส่งสูตรอาหาร',
    skipToContent: 'ข้ามไปยังเนื้อหา',
    light: 'สว่าง',
    dark: 'มืด',
    system: 'ตามระบบ',
    minutes: 'นาที',
    close: 'ปิด',
    retry: 'ลองอีกครั้ง',
    footerNote: 'สูตรอาหารจากทั่วโลก เป็นภาษาอังกฤษ เยอรมัน ญี่ปุ่น และไทย',
    notFoundTitle: 'ไม่พบหน้านี้',
    notFoundDescription: 'หน้านี้ไม่มีอยู่หรือถูกย้ายแล้ว',
    offlineTitle: 'คุณออฟไลน์อยู่',
    offlineDescription: 'ยังเปิดดูสูตรที่เคยเปิดไว้ได้ สูตรใหม่จะมาเมื่อกลับมาออนไลน์',
    statusOnline: 'ออนไลน์',
    statusOffline: 'ออฟไลน์',
    retryConnection: 'ลองเชื่อมต่อใหม่',
    connected: 'เชื่อมต่อแล้ว',
    offlineBanner: 'คุณออฟไลน์อยู่ กำลังแสดงเนื้อหาที่บันทึกไว้',
    updateAvailable: 'มีเวอร์ชันใหม่',
    update: 'อัปเดต',
    installPrompt: 'ติดตั้งคอลเลกชันสูตรอาหารเป็นแอป',
    install: 'ติดตั้ง',
    recipeNotFound: 'ไม่พบสูตรอาหาร',
    
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
    backToHome: 'กลับสู่หน้าหลัก',
    viewOriginalRecipe: 'ดูสูตรอาหารต้นฉบับ',
    step: 'ขั้นตอนที่',
    
    // Daily voting system
    dailyVote: {
      title: 'โหวตสูตรอาหารประจำวัน'
    }
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
