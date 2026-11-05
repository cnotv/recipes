export type SubmissionStatus = 'queued' | 'importing' | 'translating' | 'pending' | 'published' | 'rejected' | 'failed'

export type Submission = { id: string; status: SubmissionStatus; reason?: string }

export type SubmitOutcome = { ok: true; submission: Submission } | { ok: false; message: string }

export type PendingStep = { content: string; image: string }

export type PendingTranslation = { title: string; description?: string; ingredients: string[]; steps: PendingStep[] }

export type PendingSubmission = {
  id: string
  url: string
  translated: boolean
  recipe: { slug: string; cuisine: string; difficulty: string; languages: Record<string, PendingTranslation> }
}

export type AdminSession = { enabled: boolean; signedIn: boolean }
