import type { PageCopy, SeoLanguage, StaticPageKey } from './seo-types.ts'

export const SITE_NAMES: Record<SeoLanguage, string> = {
  en: 'Recipe Collection',
  de: 'Rezeptsammlung',
  jp: 'レシピ集',
  th: 'คอลเลกชันสูตรอาหาร',
}

export const DEFAULT_DESCRIPTION: Record<SeoLanguage, string> = {
  en: 'Recipes from around the world in English, German, Japanese and Thai.',
  de: 'Rezepte aus aller Welt auf Englisch, Deutsch, Japanisch und Thai.',
  jp: '世界のレシピを英語、ドイツ語、日本語、タイ語で紹介します。',
  th: 'สูตรอาหารจากทั่วโลก เป็นภาษาอังกฤษ เยอรมัน ญี่ปุ่น และไทย',
}

export const PAGE_COPY: Record<StaticPageKey, Record<SeoLanguage, PageCopy>> = {
  home: {
    en: {
      title: 'Recipe Collection: international recipes in four languages',
      description: 'Browse recipes from Japan, Italy, India, Thailand, China and more, with step by step instructions in English, German, Japanese and Thai.',
    },
    de: {
      title: 'Rezeptsammlung: internationale Rezepte in vier Sprachen',
      description: 'Rezepte aus Japan, Italien, Indien, Thailand, China und mehr, mit Anleitung Schritt für Schritt auf Englisch, Deutsch, Japanisch und Thai.',
    },
    jp: {
      title: 'レシピ集: 4つの言語で読む世界のレシピ',
      description: '日本、イタリア、インド、タイ、中国などのレシピを、英語、ドイツ語、日本語、タイ語の手順つきで紹介します。',
    },
    th: {
      title: 'คอลเลกชันสูตรอาหาร: สูตรอาหารจากทั่วโลกใน 4 ภาษา',
      description: 'สูตรอาหารจากญี่ปุ่น อิตาลี อินเดีย ไทย จีน และอื่น ๆ พร้อมขั้นตอนเป็นภาษาอังกฤษ เยอรมัน ญี่ปุ่น และไทย',
    },
  },
  voteNew: {
    en: { title: 'Choose a recipe together: start a vote', description: 'Pick a few recipes, share the link and let everyone vote on what to cook. Results update live.' },
    de: { title: 'Gemeinsam ein Rezept wählen: Abstimmung starten', description: 'Wähle ein paar Rezepte, teile den Link und lass alle abstimmen, was gekocht wird. Das Ergebnis aktualisiert sich live.' },
    jp: { title: 'みんなでレシピを決める: 投票を始める', description: 'いくつかのレシピを選んでリンクを共有し、何を作るかみんなで投票します。結果はリアルタイムで更新されます。' },
    th: { title: 'เลือกสูตรอาหารด้วยกัน: เริ่มโหวต', description: 'เลือกสูตรอาหารสองสามอย่าง แชร์ลิงก์ แล้วให้ทุกคนโหวตว่าจะทำอะไร ผลโหวตอัปเดตแบบสด' },
  },
  submit: {
    en: { title: 'Submit a recipe: add a link and we import it', description: 'Paste the link to a recipe page. It is read, translated into four languages and published once it has been approved.' },
    de: { title: 'Rezept einreichen: Link einfügen, wir importieren es', description: 'Füge den Link zu einer Rezeptseite ein. Sie wird gelesen, in vier Sprachen übersetzt und nach der Freigabe veröffentlicht.' },
    jp: { title: 'レシピを投稿: リンクを貼ると取り込みます', description: 'レシピページのリンクを貼ってください。内容を読み取り、4つの言語に翻訳し、承認後に公開します。' },
    th: { title: 'ส่งสูตรอาหาร: วางลิงก์แล้วเรานำเข้าให้', description: 'วางลิงก์หน้าสูตรอาหาร ระบบจะอ่าน แปลเป็นสี่ภาษา และเผยแพร่หลังได้รับการอนุมัติ' },
  },
  impressum: {
    en: { title: 'Legal notice (Impressum)', description: 'Provider identification under section 5 DDG for the Recipe Collection website.' },
    de: { title: 'Impressum', description: 'Anbieterkennzeichnung nach § 5 DDG für die Website Rezeptsammlung.' },
    jp: { title: 'Legal notice (Impressum)', description: 'Provider identification under section 5 DDG for the Recipe Collection website.' },
    th: { title: 'Legal notice (Impressum)', description: 'Provider identification under section 5 DDG for the Recipe Collection website.' },
  },
  datenschutz: {
    en: { title: 'Privacy policy', description: 'Which data the Recipe Collection website processes, why, who receives it and what rights you have.' },
    de: { title: 'Datenschutzerklärung', description: 'Welche Daten die Website Rezeptsammlung verarbeitet, warum, wer sie erhält und welche Rechte du hast.' },
    jp: { title: 'Privacy policy', description: 'Which data the Recipe Collection website processes, why, who receives it and what rights you have.' },
    th: { title: 'Privacy policy', description: 'Which data the Recipe Collection website processes, why, who receives it and what rights you have.' },
  },
}
