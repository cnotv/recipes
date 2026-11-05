import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { VoteSessionResponse, VoteSessionState } from '../../server/vote-types'
import { castVote, closeVote, eventsPath, fetchVote, joinVote, voteAvailable, voteStateSchema } from './voteApi'

const CLOCK_TICK_MS = 1000

/** One vote session: loaded once, then kept current by the event stream; the browser reconnects on its own. */
export const useVoteSession = (id: string) => {
  const session = ref<VoteSessionResponse>()
  const notFound = ref(false)
  const loading = ref(true)
  const now = ref(Date.now())
  const events = ref<EventSource>()
  const clock = ref<ReturnType<typeof setInterval>>()

  const load = async (): Promise<void> => {
    const loaded = await fetchVote(id)
    session.value = loaded
    notFound.value = loaded === undefined
    loading.value = false
  }

  const applyStreamedState = (message: MessageEvent<string>): void => {
    const parsed = voteStateSchema.safeParse(JSON.parse(message.data))
    if (parsed.success && session.value) session.value = mergeState(session.value, parsed.data)
  }

  // The stream carries what everyone sees; who this browser is stays as it was last fetched.
  const mergeState = (current: VoteSessionResponse, state: VoteSessionState): VoteSessionResponse => ({ ...state, viewer: current.viewer })

  const open = computed(() => session.value?.status === 'open' && now.value < Date.parse(session.value.endsAt))
  const ended = computed(() => session.value !== undefined && !open.value)
  const status = computed(() => (session.value?.status === 'open' && ended.value ? 'expired' : session.value?.status))

  // The server decides the winner, so ask again the moment the end time passes.
  watch(ended, (isEnded) => {
    if (isEnded && session.value?.status === 'open') void load()
  })

  const act = async (action: () => Promise<void>): Promise<void> => {
    await action()
    await load()
  }

  onMounted(async () => {
    clock.value = setInterval(() => {
      now.value = Date.now()
    }, CLOCK_TICK_MS)
    if (!voteAvailable) {
      loading.value = false
      return
    }
    await load()
    if (!notFound.value) {
      events.value = new EventSource(eventsPath(id))
      events.value.addEventListener('state', (message) => applyStreamedState(message))
    }
  })

  onBeforeUnmount(() => {
    events.value?.close()
    clearInterval(clock.value)
  })

  return {
    session,
    notFound,
    loading,
    open,
    status,
    join: (name: string) => act(() => joinVote(id, name)),
    vote: (recipeSlug: string) => act(() => castVote(id, recipeSlug)),
    close: () => act(() => closeVote(id)),
  }
}
