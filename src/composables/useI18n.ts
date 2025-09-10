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
  viewOriginalRecipe: string
  step: string
  
  // Daily voting system
  dailyVote: {
    title: string
    subtitle: string
    totalVotes: string
    sessionCode: string
    copyCode: string
    createSession: string
    createSessionDesc: string
    sessionName: string
    sessionNamePlaceholder: string
    selectRecipes: string
    createSessionBtn: string
    joinSession: string
    joinSessionDesc: string
    enterCode: string
    joinBtn: string
    leaveSession: string
    votes: string
    connectedUsers: string
    anonymousUser: string
    voted: string
    notVoted: string
  }
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
    backToHome: 'Back to Home',
    viewOriginalRecipe: 'View Original Recipe',
    step: 'Step',
    
    // Daily voting system
    dailyVote: {
      title: 'Daily Recipe Vote',
      subtitle: 'Vote together to decide what to cook today!',
      totalVotes: 'total votes',
      sessionCode: 'Session Code',
      copyCode: 'Copy code',
      createSession: 'Create New Session',
      createSessionDesc: 'Start a new voting session with friends and family',
      sessionName: 'Session Name',
      sessionNamePlaceholder: 'Enter a name for your voting session',
      selectRecipes: 'Select Recipes (minimum 2)',
      createSessionBtn: 'Create Session',
      joinSession: 'Join Existing Session',
      joinSessionDesc: 'Join a voting session using a session code',
      enterCode: 'Enter session code',
      joinBtn: 'Join Session',
      leaveSession: 'Leave Session',
      votes: 'votes',
      connectedUsers: 'Connected Users',
      anonymousUser: 'Anonymous User',
      voted: 'Voted',
      notVoted: 'Not voted yet'
    }
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
    backToHome: 'Zurück zu Rezepten',
    viewOriginalRecipe: 'Originalrezept ansehen',
    step: 'Schritt',
    
    // Daily voting system
    dailyVote: {
      title: 'Tägliche Rezept-Abstimmung',
      subtitle: 'Stimmt gemeinsam ab, was heute gekocht wird!',
      totalVotes: 'Stimmen insgesamt',
      sessionCode: 'Sitzungscode',
      copyCode: 'Code kopieren',
      createSession: 'Neue Sitzung erstellen',
      createSessionDesc: 'Starte eine neue Abstimmungssitzung mit Freunden und Familie',
      sessionName: 'Sitzungsname',
      sessionNamePlaceholder: 'Namen für deine Abstimmungssitzung eingeben',
      selectRecipes: 'Rezepte auswählen (mindestens 2)',
      createSessionBtn: 'Sitzung erstellen',
      joinSession: 'Bestehende Sitzung beitreten',
      joinSessionDesc: 'Tritt einer Abstimmungssitzung mit einem Sitzungscode bei',
      enterCode: 'Sitzungscode eingeben',
      joinBtn: 'Sitzung beitreten',
      leaveSession: 'Sitzung verlassen',
      votes: 'Stimmen',
      connectedUsers: 'Verbundene Benutzer',
      anonymousUser: 'Anonymer Benutzer',
      voted: 'Abgestimmt',
      notVoted: 'Noch nicht abgestimmt'
    }
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
    backToHome: 'レシピ一覧に戻る',
    viewOriginalRecipe: '元のレシピを見る',
    step: 'ステップ',
    
    // Daily voting system
    dailyVote: {
      title: '今日のレシピ投票',
      subtitle: '今日何を作るか一緒に決めましょう！',
      totalVotes: '総投票数',
      sessionCode: 'セッションコード',
      copyCode: 'コードをコピー',
      createSession: '新しいセッションを作成',
      createSessionDesc: '友達や家族と新しい投票セッションを開始',
      sessionName: 'セッション名',
      sessionNamePlaceholder: '投票セッションの名前を入力',
      selectRecipes: 'レシピを選択（最低2つ）',
      createSessionBtn: 'セッション作成',
      joinSession: '既存セッションに参加',
      joinSessionDesc: 'セッションコードを使って投票セッションに参加',
      enterCode: 'セッションコードを入力',
      joinBtn: 'セッションに参加',
      leaveSession: 'セッションを退出',
      votes: '票',
      connectedUsers: '接続中のユーザー',
      anonymousUser: '匿名ユーザー',
      voted: '投票済み',
      notVoted: 'まだ投票していません'
    }
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
    backToHome: 'กลับสู่หน้าหลัก',
    viewOriginalRecipe: 'ดูสูตรอาหารต้นฉบับ',
    step: 'ขั้นตอนที่',
    
    // Daily voting system
    dailyVote: {
      title: 'โหวตสูตรอาหารประจำวัน',
      subtitle: 'โหวตร่วมกันเพื่อตัดสินใจว่าจะทำอาหารอะไรวันนี้!',
      totalVotes: 'คะแนนโหวตทั้งหมด',
      sessionCode: 'รหัสเซสชัน',
      copyCode: 'คัดลอกรหัส',
      createSession: 'สร้างเซสชันใหม่',
      createSessionDesc: 'เริ่มเซสชันโหวตใหม่กับเพื่อนและครอบครัว',
      sessionName: 'ชื่อเซสชัน',
      sessionNamePlaceholder: 'ใส่ชื่อสำหรับเซสชันโหวตของคุณ',
      selectRecipes: 'เลือกสูตรอาหาร (อย่างน้อย 2 สูตร)',
      createSessionBtn: 'สร้างเซสชัน',
      joinSession: 'เข้าร่วมเซสชันที่มีอยู่',
      joinSessionDesc: 'เข้าร่วมเซสชันโหวตโดยใช้รหัสเซสชัน',
      enterCode: 'ใส่รหัสเซสชัน',
      joinBtn: 'เข้าร่วมเซสชัน',
      leaveSession: 'ออกจากเซสชัน',
      votes: 'คะแนนโหวต',
      connectedUsers: 'ผู้ใช้ที่เชื่อมต่อ',
      anonymousUser: 'ผู้ใช้ไม่ระบุชื่อ',
      voted: 'โหวตแล้ว',
      notVoted: 'ยังไม่ได้โหวต'
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
