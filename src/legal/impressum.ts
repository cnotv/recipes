import { operator } from './operator.ts'
import type { LegalDocument, LegalLanguage } from './types.ts'

const address = [operator.name, operator.street, operator.postalCodeAndCity, operator.country]

export const impressum: Record<LegalLanguage, LegalDocument> = {
  de: {
    title: 'Impressum',
    updated: 'Stand: [PLATZHALTER: Datum]',
    sections: [
      { heading: 'Angaben gemäß § 5 DDG', paragraphs: [address.join(', ')] },
      {
        heading: 'Kontakt',
        paragraphs: [`E-Mail: ${operator.email}`, `Telefon: ${operator.phone}`],
      },
      { heading: 'Umsatzsteuer-Identifikationsnummer', paragraphs: [operator.vatId] },
      { heading: 'Verantwortlich für Inhalte nach § 18 Abs. 2 MStV', paragraphs: [operator.contentResponsible] },
      {
        heading: 'Herkunft der Rezepte',
        paragraphs: [
          'Die Rezepte dieser Seite wurden von anderen Webseiten übernommen. Bei jedem Rezept steht die Quelle mit Link. Texte und Bilder gehören ihren Urhebern.',
          `Wenn du Urheber eines Inhalts bist und ihn entfernt haben möchtest, schreibe an ${operator.email}. Der Inhalt wird nach Prüfung zügig entfernt.`,
        ],
      },
      {
        heading: 'Haftung für Links',
        paragraphs: [
          'Diese Seite verlinkt auf Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte übernehmen wir keine Gewähr. Verantwortlich ist stets der jeweilige Anbieter. Bei Bekanntwerden von Rechtsverletzungen entfernen wir solche Links umgehend.',
        ],
      },
    ],
  },
  en: {
    title: 'Legal notice (Impressum)',
    updated: 'Last updated: [PLACEHOLDER: date]',
    sections: [
      { heading: 'Provider under section 5 DDG', paragraphs: [address.join(', ')] },
      {
        heading: 'Contact',
        paragraphs: [`E-mail: ${operator.email}`, `Telephone: ${operator.phone}`],
      },
      { heading: 'VAT identification number', paragraphs: [operator.vatId] },
      { heading: 'Responsible for content under section 18 (2) MStV', paragraphs: [operator.contentResponsible] },
      {
        heading: 'Where the recipes come from',
        paragraphs: [
          'The recipes on this site were taken from other websites. Every recipe names its source and links to it. Text and pictures belong to their authors.',
          `If you are the author of a piece of content and want it removed, write to ${operator.email}. After a check it is removed promptly.`,
        ],
      },
      {
        heading: 'Liability for links',
        paragraphs: [
          'This site links to websites of third parties whose content we do not control. We give no guarantee for that content. The respective provider is always responsible for it. If we learn of a violation of the law, we remove the link promptly.',
        ],
      },
    ],
  },
}
