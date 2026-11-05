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
  
  // Legal, source, submit and admin
  footerImpressum: string
  footerPrivacy: string
  sourceHeading: string
  sourceNote: string
  sourceLink: string
  submitTitle: string
  submitIntro: string
  submitPrivacyNote: string
  submitPrivacyLink: string
  submitPreviewTitle: string
  submitPreviewDescription: string
  submitLinkLabel: string
  submitLinkPlaceholder: string
  submitLinkHint: string
  submitSend: string
  submitWaiting: string
  submitReading: string
  submitTranslating: string
  submitProgress: string
  submitThanksTitle: string
  submitThanksDescription: string
  submitAnother: string
  submitFailedTitle: string
  submitFailedFallback: string
  submitTryAnother: string
  adminTitle: string
  adminLoading: string
  adminOffTitle: string
  adminOffDescription: string
  adminTokenLabel: string
  adminSignIn: string
  adminSignOut: string
  adminEmptyTitle: string
  adminNotTranslated: string
  adminSource: string
  adminApprove: string
  adminReject: string
  adminApproved: string
  adminRejected: string
  
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
    
    // Legal, source, submit and admin
    footerImpressum: 'Legal notice',
    footerPrivacy: 'Privacy policy',
    sourceHeading: 'Source',
    sourceNote: 'This recipe was first published on {site}. Its text and pictures come from there and belong to their authors.',
    sourceLink: 'Read the original recipe on {site}',
    submitTitle: 'Submit a recipe',
    submitIntro: 'Paste the link to a recipe page. It is read, translated into English, German, Japanese and Thai, and published once it has been approved.',
    submitPrivacyNote: 'To read and translate it, the text of the page is sent to a language model service (OpenRouter and the model providers behind it). Details are in the',
    submitPrivacyLink: 'privacy policy',
    submitPreviewTitle: 'Submitting is not available in this preview',
    submitPreviewDescription: 'This copy of the site has no server behind it. Open the full site to submit a recipe link.',
    submitLinkLabel: 'Recipe link',
    submitLinkPlaceholder: 'https://example.com/my-favourite-recipe',
    submitLinkHint: 'A public http or https page.',
    submitSend: 'Import recipe',
    submitWaiting: 'Waiting for its turn',
    submitReading: 'Reading the page',
    submitTranslating: 'Translating into English, German, Japanese and Thai',
    submitProgress: 'Import progress',
    submitThanksTitle: 'Thank you, your recipe is waiting for approval',
    submitThanksDescription: 'It will appear on the site as soon as it has been looked at.',
    submitAnother: 'Submit another link',
    submitFailedTitle: 'This link could not be imported',
    submitFailedFallback: 'The import did not finish.',
    submitTryAnother: 'Try another link',
    adminTitle: 'Approve recipes',
    adminLoading: 'Loading',
    adminOffTitle: 'Admin is switched off',
    adminOffDescription: 'Set RECIPES_ADMIN_TOKEN on the server to turn it on.',
    adminTokenLabel: 'Admin token',
    adminSignIn: 'Sign in',
    adminSignOut: 'Sign out',
    adminEmptyTitle: 'Nothing is waiting for approval',
    adminNotTranslated: 'Not translated',
    adminSource: 'Source',
    adminApprove: 'Approve',
    adminReject: 'Reject',
    adminApproved: '{title} was approved and published.',
    adminRejected: '{title} was rejected.',
    
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
    
    // Legal, source, submit and admin
    footerImpressum: 'Impressum',
    footerPrivacy: 'Datenschutz',
    sourceHeading: 'Quelle',
    sourceNote: 'Dieses Rezept wurde zuerst auf {site} veröffentlicht. Text und Bilder stammen von dort und gehören ihren Urhebern.',
    sourceLink: 'Originalrezept auf {site} lesen',
    submitTitle: 'Rezept einreichen',
    submitIntro: 'Füge den Link zu einer Rezeptseite ein. Sie wird gelesen, ins Englische, Deutsche, Japanische und Thailändische übersetzt und nach der Freigabe veröffentlicht.',
    submitPrivacyNote: 'Zum Lesen und Übersetzen wird der Text der Seite an einen Sprachmodell-Dienst gesendet (OpenRouter und die dahinterstehenden Modellanbieter). Einzelheiten stehen in der',
    submitPrivacyLink: 'Datenschutzerklärung',
    submitPreviewTitle: 'Einreichen ist in dieser Vorschau nicht möglich',
    submitPreviewDescription: 'Diese Kopie der Website hat keinen Server dahinter. Öffne die vollständige Website, um einen Rezeptlink einzureichen.',
    submitLinkLabel: 'Rezeptlink',
    submitLinkPlaceholder: 'https://example.com/mein-lieblingsrezept',
    submitLinkHint: 'Eine öffentliche http- oder https-Seite.',
    submitSend: 'Rezept importieren',
    submitWaiting: 'Wartet auf die Bearbeitung',
    submitReading: 'Seite wird gelesen',
    submitTranslating: 'Übersetzung ins Englische, Deutsche, Japanische und Thailändische',
    submitProgress: 'Fortschritt des Imports',
    submitThanksTitle: 'Danke, dein Rezept wartet auf die Freigabe',
    submitThanksDescription: 'Es erscheint auf der Website, sobald es geprüft wurde.',
    submitAnother: 'Weiteren Link einreichen',
    submitFailedTitle: 'Dieser Link konnte nicht importiert werden',
    submitFailedFallback: 'Der Import wurde nicht abgeschlossen.',
    submitTryAnother: 'Anderen Link versuchen',
    adminTitle: 'Rezepte freigeben',
    adminLoading: 'Wird geladen',
    adminOffTitle: 'Admin ist abgeschaltet',
    adminOffDescription: 'Setze RECIPES_ADMIN_TOKEN auf dem Server, um ihn einzuschalten.',
    adminTokenLabel: 'Admin-Token',
    adminSignIn: 'Anmelden',
    adminSignOut: 'Abmelden',
    adminEmptyTitle: 'Nichts wartet auf Freigabe',
    adminNotTranslated: 'Nicht übersetzt',
    adminSource: 'Quelle',
    adminApprove: 'Freigeben',
    adminReject: 'Ablehnen',
    adminApproved: '{title} wurde freigegeben und veröffentlicht.',
    adminRejected: '{title} wurde abgelehnt.',
    
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
    
    // Legal, source, submit and admin
    footerImpressum: '運営者情報 (Impressum)',
    footerPrivacy: 'プライバシーポリシー',
    sourceHeading: '出典',
    sourceNote: 'このレシピは最初に{site}で公開されました。文章と画像はそちらのもので、著作者に帰属します。',
    sourceLink: '{site}で元のレシピを読む',
    submitTitle: 'レシピを投稿',
    submitIntro: 'レシピページのリンクを貼ってください。内容を読み取り、英語、ドイツ語、日本語、タイ語に翻訳し、承認後に公開します。',
    submitPrivacyNote: '読み取りと翻訳のため、ページの文章は言語モデルのサービス(OpenRouterとその先のモデル提供元)に送信されます。詳しくは',
    submitPrivacyLink: 'プライバシーポリシー',
    submitPreviewTitle: 'このプレビューでは投稿できません',
    submitPreviewDescription: 'このサイトのコピーにはサーバーがありません。レシピのリンクを投稿するには本サイトを開いてください。',
    submitLinkLabel: 'レシピのリンク',
    submitLinkPlaceholder: 'https://example.com/my-favourite-recipe',
    submitLinkHint: '公開されているhttpまたはhttpsのページ。',
    submitSend: 'レシピを取り込む',
    submitWaiting: '順番待ち',
    submitReading: 'ページを読み取り中',
    submitTranslating: '英語、ドイツ語、日本語、タイ語に翻訳中',
    submitProgress: '取り込みの進行状況',
    submitThanksTitle: 'ありがとうございます。レシピは承認待ちです',
    submitThanksDescription: '確認でき次第、サイトに表示されます。',
    submitAnother: '別のリンクを投稿',
    submitFailedTitle: 'このリンクは取り込めませんでした',
    submitFailedFallback: '取り込みが完了しませんでした。',
    submitTryAnother: '別のリンクを試す',
    adminTitle: 'レシピの承認',
    adminLoading: '読み込み中',
    adminOffTitle: '管理画面は無効です',
    adminOffDescription: '有効にするには、サーバーでRECIPES_ADMIN_TOKENを設定してください。',
    adminTokenLabel: '管理トークン',
    adminSignIn: 'サインイン',
    adminSignOut: 'サインアウト',
    adminEmptyTitle: '承認待ちはありません',
    adminNotTranslated: '未翻訳',
    adminSource: '出典',
    adminApprove: '承認',
    adminReject: '却下',
    adminApproved: '{title}を承認して公開しました。',
    adminRejected: '{title}を却下しました。',
    
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
    
    // Legal, source, submit and admin
    footerImpressum: 'ข้อมูลผู้ให้บริการ (Impressum)',
    footerPrivacy: 'นโยบายความเป็นส่วนตัว',
    sourceHeading: 'แหล่งที่มา',
    sourceNote: 'สูตรอาหารนี้เผยแพร่ครั้งแรกที่ {site} ข้อความและรูปภาพมาจากที่นั่นและเป็นของเจ้าของผลงาน',
    sourceLink: 'อ่านสูตรต้นฉบับที่ {site}',
    submitTitle: 'ส่งสูตรอาหาร',
    submitIntro: 'วางลิงก์หน้าสูตรอาหาร ระบบจะอ่าน แปลเป็นภาษาอังกฤษ เยอรมัน ญี่ปุ่น และไทย แล้วเผยแพร่หลังได้รับการอนุมัติ',
    submitPrivacyNote: 'ข้อความของหน้าจะถูกส่งไปยังบริการโมเดลภาษา (OpenRouter และผู้ให้บริการโมเดลเบื้องหลัง) เพื่ออ่านและแปล ดูรายละเอียดใน',
    submitPrivacyLink: 'นโยบายความเป็นส่วนตัว',
    submitPreviewTitle: 'ส่งสูตรอาหารไม่ได้ในตัวอย่างนี้',
    submitPreviewDescription: 'เว็บไซต์ฉบับนี้ไม่มีเซิร์ฟเวอร์ ให้เปิดเว็บไซต์จริงเพื่อส่งลิงก์สูตรอาหาร',
    submitLinkLabel: 'ลิงก์สูตรอาหาร',
    submitLinkPlaceholder: 'https://example.com/my-favourite-recipe',
    submitLinkHint: 'หน้าเว็บสาธารณะแบบ http หรือ https',
    submitSend: 'นำเข้าสูตรอาหาร',
    submitWaiting: 'รอคิว',
    submitReading: 'กำลังอ่านหน้าเว็บ',
    submitTranslating: 'กำลังแปลเป็นภาษาอังกฤษ เยอรมัน ญี่ปุ่น และไทย',
    submitProgress: 'ความคืบหน้าการนำเข้า',
    submitThanksTitle: 'ขอบคุณ สูตรอาหารของคุณรอการอนุมัติ',
    submitThanksDescription: 'จะแสดงบนเว็บไซต์เมื่อตรวจสอบแล้ว',
    submitAnother: 'ส่งลิงก์อื่น',
    submitFailedTitle: 'นำเข้าลิงก์นี้ไม่ได้',
    submitFailedFallback: 'การนำเข้าไม่เสร็จสิ้น',
    submitTryAnother: 'ลองลิงก์อื่น',
    adminTitle: 'อนุมัติสูตรอาหาร',
    adminLoading: 'กำลังโหลด',
    adminOffTitle: 'ปิดการใช้งานผู้ดูแลอยู่',
    adminOffDescription: 'ตั้งค่า RECIPES_ADMIN_TOKEN บนเซิร์ฟเวอร์เพื่อเปิดใช้งาน',
    adminTokenLabel: 'โทเคนผู้ดูแล',
    adminSignIn: 'เข้าสู่ระบบ',
    adminSignOut: 'ออกจากระบบ',
    adminEmptyTitle: 'ไม่มีรายการรออนุมัติ',
    adminNotTranslated: 'ยังไม่ได้แปล',
    adminSource: 'แหล่งที่มา',
    adminApprove: 'อนุมัติ',
    adminReject: 'ปฏิเสธ',
    adminApproved: 'อนุมัติและเผยแพร่ {title} แล้ว',
    adminRejected: 'ปฏิเสธ {title} แล้ว',
    
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
