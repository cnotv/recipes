import { z } from 'zod'
import type { AdminSession, PendingSubmission, Submission, SubmitOutcome } from '../types/submission'

const submissionSchema: z.ZodType<Submission> = z.object({
  id: z.string(),
  status: z.enum(['queued', 'importing', 'translating', 'pending', 'published', 'rejected', 'failed']),
  reason: z.string().optional(),
})

const pendingListSchema: z.ZodType<PendingSubmission[]> = z.array(
  z.object({
    id: z.string(),
    url: z.string(),
    translated: z.boolean(),
    recipe: z.object({
      slug: z.string(),
      cuisine: z.string(),
      difficulty: z.string(),
      languages: z.record(
        z.string(),
        z.object({
          title: z.string(),
          description: z.string().optional(),
          ingredients: z.array(z.string()),
          steps: z.array(z.object({ content: z.string(), image: z.string() })),
        }),
      ),
    }),
  }),
)

const adminSessionSchema: z.ZodType<AdminSession> = z.object({ enabled: z.boolean(), signedIn: z.boolean() })
const errorSchema = z.object({ error: z.string() })

const request = (method: string, path: string, body?: unknown): Promise<Response> =>
  fetch(path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

const failureMessage = async (response: Response): Promise<string> => {
  const parsed = errorSchema.safeParse(await response.json().catch(() => undefined))
  return parsed.success ? parsed.data.error : `The server answered with status ${response.status}`
}

/** Sends a recipe link; a refused link comes back as a message the page can show. */
export const submitLink = async (url: string): Promise<SubmitOutcome> => {
  const response = await request('POST', '/api/submissions', { url }).catch(() => undefined)
  if (response === undefined) return { ok: false, message: 'The server could not be reached' }
  if (!response.ok) return { ok: false, message: await failureMessage(response) }
  const submission = submissionSchema.safeParse(await response.json().catch(() => undefined))
  return submission.success ? { ok: true, submission: submission.data } : { ok: false, message: 'The server gave an unexpected answer' }
}

export const fetchSubmission = async (id: string): Promise<Submission | undefined> => {
  const response = await request('GET', `/api/submissions/${encodeURIComponent(id)}`).catch(() => undefined)
  const parsed = submissionSchema.safeParse(response?.ok ? await response.json().catch(() => undefined) : undefined)
  return parsed.success ? parsed.data : undefined
}

export const fetchAdminSession = async (): Promise<AdminSession> => {
  const response = await request('GET', '/api/admin/session').catch(() => undefined)
  const parsed = adminSessionSchema.safeParse(response?.ok ? await response.json().catch(() => undefined) : undefined)
  return parsed.success ? parsed.data : { enabled: false, signedIn: false }
}

/** Returns an error message, or undefined once signed in. */
export const signInAsAdmin = async (token: string): Promise<string | undefined> => {
  const response = await request('POST', '/api/admin/session', { token }).catch(() => undefined)
  if (response === undefined) return 'The server could not be reached'
  return response.ok ? undefined : failureMessage(response)
}

export const signOutAdmin = async (): Promise<void> => {
  await request('DELETE', '/api/admin/session').catch(() => undefined)
}

export const fetchPendingSubmissions = async (): Promise<PendingSubmission[] | undefined> => {
  const response = await request('GET', '/api/admin/submissions').catch(() => undefined)
  const parsed = pendingListSchema.safeParse(response?.ok ? await response.json().catch(() => undefined) : undefined)
  return parsed.success ? parsed.data : undefined
}

/** Returns an error message, or undefined when the decision was stored. */
export const decideSubmission = async (id: string, decision: 'approve' | 'reject'): Promise<string | undefined> => {
  const response = await request('POST', `/api/admin/submissions/${encodeURIComponent(id)}/${decision}`, {}).catch(() => undefined)
  if (response === undefined) return 'The server could not be reached'
  return response.ok ? undefined : failureMessage(response)
}
