const userFacing = Symbol('userFacing')

/** An error whose message is safe to show to the person who submitted a link. */
export const userError = (message: string): Error => Object.assign(new Error(message), { [userFacing]: true })

/** The message of a user facing error; anything else may carry internals, so it becomes the fallback. */
export const userMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && userFacing in error ? error.message : fallback
