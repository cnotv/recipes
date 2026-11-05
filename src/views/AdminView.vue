<script setup lang="ts">
import { onMounted, ref } from 'vue'
import UiBadge from '../ui/UiBadge.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiInput from '../ui/UiInput.vue'
import UiTabs from '../ui/UiTabs.vue'
import {
  decideSubmission,
  fetchAdminSession,
  fetchPendingSubmissions,
  signInAsAdmin,
  signOutAdmin,
} from '../lib/submissionApi'
import type { PendingSubmission } from '../types/submission'

type Phase = 'loading' | 'disabled' | 'signin' | 'list'

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', de: 'Deutsch', jp: '日本語', th: 'ภาษาไทย' }

const phase = ref<Phase>('loading')
const token = ref('')
const signInError = ref<string | undefined>()
const submissions = ref<PendingSubmission[]>([])
const chosenLanguage = ref<Record<string, string>>({})
const notice = ref<string | undefined>()

const languagesOf = (submission: PendingSubmission): string[] => Object.keys(submission.recipe.languages)
const tabsOf = (submission: PendingSubmission) =>
  languagesOf(submission).map((language) => ({ value: language, label: LANGUAGE_LABELS[language] ?? language }))
const titleOf = (submission: PendingSubmission): string => Object.values(submission.recipe.languages)[0]?.title ?? submission.url

const loadList = async (): Promise<void> => {
  const list = await fetchPendingSubmissions()
  if (list === undefined) {
    phase.value = 'signin'
    return
  }
  submissions.value = list
  chosenLanguage.value = Object.fromEntries(list.map((item) => [item.id, languagesOf(item)[0] ?? 'en']))
  phase.value = 'list'
}

const signIn = async (): Promise<void> => {
  signInError.value = await signInAsAdmin(token.value)
  token.value = ''
  if (signInError.value === undefined) await loadList()
}

const signOut = async (): Promise<void> => {
  await signOutAdmin()
  submissions.value = []
  phase.value = 'signin'
}

const decide = async (submission: PendingSubmission, decision: 'approve' | 'reject'): Promise<void> => {
  const failure = await decideSubmission(submission.id, decision)
  notice.value = failure ?? `${titleOf(submission)} was ${decision === 'approve' ? 'approved and published' : 'rejected'}.`
  if (failure === undefined) submissions.value = submissions.value.filter((item) => item.id !== submission.id)
}

onMounted(async () => {
  const session = await fetchAdminSession()
  if (!session.enabled) phase.value = 'disabled'
  else if (session.signedIn) await loadList()
  else phase.value = 'signin'
})
</script>

<template>
  <main class="admin-view">
    <h1 class="admin-view__title">Approve recipes</h1>

    <p v-if="phase === 'loading'" role="status">Loading</p>

    <UiEmptyState
      v-else-if="phase === 'disabled'"
      icon="info"
      title="Admin is switched off"
      description="Set RECIPES_ADMIN_TOKEN on the server to turn it on."
    />

    <form v-else-if="phase === 'signin'" class="admin-view__signin" novalidate @submit.prevent="signIn">
      <UiInput v-model="token" type="password" label="Admin token" :error="signInError" />
      <UiButton type="submit" :disabled="token === ''">Sign in</UiButton>
    </form>

    <template v-else>
      <div class="admin-view__bar">
        <p v-if="notice" role="status">{{ notice }}</p>
        <UiButton variant="ghost" size="sm" @click="signOut">Sign out</UiButton>
      </div>

      <UiEmptyState v-if="submissions.length === 0" icon="check" title="Nothing is waiting for approval" />

      <article v-for="submission in submissions" :key="submission.id" class="admin-view__item">
        <header class="admin-view__header">
          <h2 class="admin-view__name">{{ titleOf(submission) }}</h2>
          <UiBadge v-if="!submission.translated" tone="highlight">Not translated</UiBadge>
          <UiBadge>{{ submission.recipe.difficulty }}</UiBadge>
        </header>
        <p class="admin-view__source">
          Source:
          <a :href="submission.url" target="_blank" rel="noopener noreferrer">{{ submission.url }}</a>
        </p>

        <UiTabs v-model="chosenLanguage[submission.id]" :items="tabsOf(submission)">
          <template v-for="language in languagesOf(submission)" :key="language" #[language]>
            <p v-if="submission.recipe.languages[language].description">{{ submission.recipe.languages[language].description }}</p>
            <h3 class="admin-view__section">Ingredients</h3>
            <ul>
              <li v-for="(ingredient, index) in submission.recipe.languages[language].ingredients" :key="index">{{ ingredient }}</li>
            </ul>
            <h3 class="admin-view__section">Steps</h3>
            <ol>
              <li v-for="(step, index) in submission.recipe.languages[language].steps" :key="index">{{ step.content }}</li>
            </ol>
          </template>
        </UiTabs>

        <div class="admin-view__actions">
          <UiButton @click="decide(submission, 'approve')">Approve</UiButton>
          <UiButton variant="danger" @click="decide(submission, 'reject')">Reject</UiButton>
        </div>
      </article>
    </template>
  </main>
</template>

<style scoped>
.admin-view {
  display: grid;
  gap: var(--space-6);
  max-width: 48rem;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.admin-view__title {
  font: 700 var(--font-size-2xl, 1.75rem) / var(--font-line-snug) var(--font-family-display, var(--font-family-body));
}

.admin-view__signin {
  display: grid;
  gap: var(--space-4);
  justify-items: start;
}

.admin-view__bar,
.admin-view__header,
.admin-view__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.admin-view__bar {
  justify-content: space-between;
}

.admin-view__item {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
  border: var(--size-border) solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
}

.admin-view__name {
  font: 700 var(--font-size-lg, 1.25rem) / var(--font-line-snug) var(--font-family-body);
}

.admin-view__source {
  overflow-wrap: anywhere;
  color: var(--color-text-secondary);
}

.admin-view__section {
  margin-top: var(--space-3);
  font: 700 var(--font-size-md) / var(--font-line-snug) var(--font-family-body);
}

.admin-view ul,
.admin-view ol {
  padding-left: var(--space-5);
}
</style>
