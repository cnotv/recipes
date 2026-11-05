import type { Operator } from './types.ts'

// The owner replaces every bracketed value below with the real data; nothing here is invented.
// The legal pages print these values as they are, so a bracket on the live site means a gap.
export const operator: Operator = {
  name: '[PLACEHOLDER: full name of the operator]',
  street: '[PLACEHOLDER: street and house number]',
  postalCodeAndCity: '[PLACEHOLDER: postal code and city]',
  country: 'Deutschland / Germany',
  email: '[PLACEHOLDER: e-mail address]',
  phone: '[PLACEHOLDER: telephone number, or remove if a second quick contact is offered]',
  vatId: '[PLACEHOLDER: VAT ID under section 27a UStG, or delete the line if there is none]',
  contentResponsible: '[PLACEHOLDER: name and address of the person responsible for content under section 18 (2) MStV, or delete the line]',
  supervisoryAuthority: '[PLACEHOLDER: data protection authority of the federal state of the operator]',
  serverLocation: '[PLACEHOLDER: data centre location of the Hetzner server]',
  accessLogRetention: '[PLACEHOLDER: days the reverse proxy keeps access logs]',
  modelProviders: '[PLACEHOLDER: the providers OpenRouter routes the configured model to]',
}
