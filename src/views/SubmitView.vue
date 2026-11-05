<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import UiBadge from '../ui/UiBadge.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiInput from '../ui/UiInput.vue'
import UiProgressBar from '../ui/UiProgressBar.vue'
import { fetchSubmission, submitLink } from '../lib/submissionApi'
import type { Submission, SubmissionStatus } from '../types/submission'

type Phase = 'form' | 'working' | 'pending' | 'error'

const POLL_INTERVAL_MS = 1500
// The Netlify preview build has no server behind it, so there is nothing to submit to.
const isStaticPreview = import.meta.env.VITE_DATA_SOURCE === 'static'

const WAITING = { label: 'Waiting for its turn', value: 15 }
const progressByStatus: Partial<Record<SubmissionStatus, { label: string; value: number }>> = {
  queued: WAITING,
  importing: { label: 'Reading the page', value: 45 },
  translating: { label: 'Translating into English, German, Japanese and Thai', value: 75 },
}

const link = ref('')
const formError = ref<string | undefined>()
const phase = ref<Phase>('form')
const current = ref<Submission | undefined>()
const sending = ref(false)
const pollTimer = ref<ReturnType<typeof setTimeout> | undefined>()

const progress = computed(() => progressByStatus[current.value?.status ?? 'queued'] ?? WAITING)
const failureReason = computed(() => current.value?.reason ?? 'The import did not finish.')

const stopPolling = (): void => clearTimeout(pollTimer.value)

const applyStatus = (submission: Submission): void => {
  current.value = submission
  if (submission.status === 'failed') phase.value = 'error'
  else if (progressByStatus[submission.status] === undefined) phase.value = 'pending'
  else pollTimer.value = setTimeout(poll, POLL_INTERVAL_MS)
}

const poll = async (): Promise<void> => {
  const submission = current.value && (await fetchSubmission(current.value.id))
  if (submission) applyStatus(submission)
  else pollTimer.value = setTimeout(poll, POLL_INTERVAL_MS)
}

const send = async (): Promise<void> => {
  formError.value = undefined
  sending.value = true
  const outcome = await submitLink(link.value.trim())
  sending.value = false
  if (!outcome.ok) {
    formError.value = outcome.message
    return
  }
  phase.value = 'working'
  applyStatus(outcome.submission)
}

const startOver = (): void => {
  stopPolling()
  link.value = ''
  current.value = undefined
  phase.value = 'form'
}

onBeforeUnmount(stopPolling)
</script>

<template>
  <main class="submit-view">
    <h1 class="submit-view__title">Submit a recipe</h1>
    <p class="submit-view__intro">
      Paste the link to a recipe page. It is read, translated into English, German, Japanese and Thai, and published once it has been approved.
    </p>

    <UiEmptyState
      v-if="isStaticPreview"
      icon="info"
      title="Submitting is not available in this preview"
      description="This copy of the site has no server behind it. Open the full site to submit a recipe link."
    />

    <form v-else-if="phase === 'form'" class="submit-view__form" novalidate @submit.prevent="send">
      <UiInput
        v-model="link"
        label="Recipe link"
        placeholder="https://example.com/my-favourite-recipe"
        hint="A public http or https page."
        :error="formError"
      />
      <UiButton type="submit" :disabled="sending || link.trim() === ''">Import recipe</UiButton>
    </form>

    <section v-else-if="phase === 'working'" class="submit-view__progress" aria-live="polite">
      <UiBadge tone="brand">{{ progress.label }}</UiBadge>
      <UiProgressBar :value="progress.value" label="Import progress" />
    </section>

    <UiEmptyState
      v-else-if="phase === 'pending'"
      icon="check"
      title="Thank you, your recipe is waiting for approval"
      description="It will appear on the site as soon as it has been looked at."
    >
      <UiButton variant="secondary" @click="startOver">Submit another link</UiButton>
    </UiEmptyState>

    <UiEmptyState v-else icon="alert" title="This link could not be imported" :description="failureReason">
      <UiButton variant="secondary" @click="startOver">Try another link</UiButton>
    </UiEmptyState>
  </main>
</template>

<style scoped>
.submit-view {
  display: grid;
  gap: var(--space-6);
  max-width: 40rem;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.submit-view__title {
  font: 700 var(--font-size-2xl, 1.75rem) / var(--font-line-snug) var(--font-family-display, var(--font-family-body));
}

.submit-view__intro {
  color: var(--color-text-secondary);
}

.submit-view__form,
.submit-view__progress {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

.submit-view__progress {
  width: 100%;
}

.submit-view__progress > .ui-progress {
  width: 100%;
}
</style>
