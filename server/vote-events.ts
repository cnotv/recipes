import type { VoteSessionState } from './vote-types.ts'

type Listener = (state: VoteSessionState) => unknown

/**
 * Fans a session's new state out to the event streams watching it.
 * ponytail: listeners live in this process's memory, so this holds for one server process only;
 * a second instance would need a shared channel (Redis, or polling the database).
 */
export const createVoteBroadcaster = () => {
  const listenersBySession = new Map<string, Set<Listener>>()

  const subscribe = (sessionId: string, listener: Listener): (() => void) => {
    const listeners = listenersBySession.get(sessionId) ?? new Set<Listener>()
    listeners.add(listener)
    listenersBySession.set(sessionId, listeners)
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) listenersBySession.delete(sessionId)
    }
  }

  const publish = (state: VoteSessionState): void => {
    listenersBySession.get(state.id)?.forEach((listener) => void listener(state))
  }

  return { subscribe, publish }
}
