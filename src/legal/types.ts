export type LegalSection = { heading: string; paragraphs?: string[]; items?: string[] }

export type LegalDocument = { title: string; updated: string; sections: LegalSection[] }

export type LegalLanguage = 'en' | 'de'

export type LegalPage = 'impressum' | 'datenschutz'

/** The person or company behind the site. Every value is a placeholder until the owner fills it. */
export type Operator = {
  name: string
  street: string
  postalCodeAndCity: string
  country: string
  email: string
  phone: string
  vatId: string
  contentResponsible: string
  supervisoryAuthority: string
  serverLocation: string
  accessLogRetention: string
  modelProviders: string
}
