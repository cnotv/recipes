<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import UiAvatar from '../ui/UiAvatar.vue'
import UiBadge from '../ui/UiBadge.vue'
import UiButton from '../ui/UiButton.vue'
import UiDialog from '../ui/UiDialog.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiInput from '../ui/UiInput.vue'
import UiProgressBar from '../ui/UiProgressBar.vue'
import UiRecipeCard from '../ui/UiRecipeCard.vue'
import UiToast from '../ui/UiToast.vue'
import type { BadgeTone } from '../ui/types'
import { useVoteSession } from '../composables/useVoteSession'
import { voteAvailable } from '../composables/voteApi'
import { pickTitle, useVoteText } from '../composables/voteText'
import type { VoteTextKey } from '../composables/voteText'
import './vote.css'

const props = defineProps<{ id: string }>()
const text = useVoteText()
const router = useRouter()
const { session, notFound, loading, open, status, join, vote, close } = useVoteSession(props.id)

const displayName = ref('')
const closing = ref(false)
const copied = ref(false)
const failed = ref(false)

const shareUrl = computed(() => `${window.location.origin}/vote/${props.id}`)
const canShare = typeof navigator.share === 'function'
const statusLabel: Record<string, VoteTextKey> = { open: 'statusOpen', closed: 'statusClosed', expired: 'statusExpired' }
const statusTone: Record<string, BadgeTone> = { open: 'success', closed: 'neutral', expired: 'neutral' }
const percentOf = (votes: number): number => (session.value && session.value.totalVotes > 0 ? Math.round((votes / session.value.totalVotes) * 100) : 0)

const attempt = async (action: () => Promise<void>): Promise<void> => {
  try {
    await action()
  } catch {
    failed.value = true
  }
}

const copyLink = (): Promise<void> =>
  attempt(async () => {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
  })
const shareLink = (): Promise<void> => attempt(() => navigator.share({ title: session.value?.name, url: shareUrl.value }))
const confirmClose = async (): Promise<void> => {
  closing.value = false
  await attempt(close)
}
</script>

<template>
  <main class="vote-page">
    <UiEmptyState v-if="!voteAvailable" icon="info" :title="text('staticTitle')" :description="text('staticText')" />
    <p v-else-if="loading" class="vote-page__intro">{{ text('loading') }}</p>
    <UiEmptyState v-else-if="notFound || !session" icon="search" :title="text('notFoundTitle')" :description="text('notFoundText')">
      <UiButton @click="router.push({ name: 'vote-create' })">{{ text('startOwn') }}</UiButton>
    </UiEmptyState>
    <template v-else>
      <header class="vote-page__section">
        <div class="vote-page__row">
          <h1 class="vote-page__title">{{ session.name }}</h1>
          <UiBadge :tone="statusTone[status ?? 'open']">{{ text(statusLabel[status ?? 'open']) }}</UiBadge>
        </div>
        <p class="vote-page__meta">
          {{ text('endsAt', { time: new Date(session.endsAt).toLocaleString() }) }} / {{ text('totalVotes', { n: session.totalVotes }) }}
        </p>
        <div class="vote-page__row">
          <UiButton variant="secondary" @click="copyLink">{{ text('copyLink') }}</UiButton>
          <UiButton v-if="canShare" variant="secondary" @click="shareLink">{{ text('share') }}</UiButton>
          <UiButton v-if="session.viewer.isCreator && open" variant="danger" @click="closing = true">{{ text('closeVote') }}</UiButton>
        </div>
      </header>

      <form v-if="open && !session.viewer.participantName" class="vote-page__row" @submit.prevent="attempt(() => join(displayName.trim()))">
        <UiInput v-model="displayName" :label="text('yourName')" :placeholder="text('joinTitle')" />
        <UiButton type="submit" :disabled="displayName.trim().length === 0">{{ text('joinButton') }}</UiButton>
      </form>

      <section class="vote-options" aria-live="polite">
        <div v-for="option in session.options" :key="option.slug" class="vote-option">
          <UiRecipeCard
            :recipe="{ title: pickTitle(option.titles), cuisine: option.cuisine ?? '', minutes: option.minutes, imageUrl: option.imageUrl ?? undefined }"
            :highlight="session.winnerSlugs.includes(option.slug) ? text('winner') : undefined"
            :minutes-label="text('minutes')"
            @open="router.push({ name: 'recipe-detail', params: { slug: option.slug } })"
          />
          <div class="vote-option__tally">
            <span>{{ text('votesCount', { n: option.votes }) }}</span>
            <span>{{ percentOf(option.votes) }}%</span>
          </div>
          <UiProgressBar :value="percentOf(option.votes)" :label="pickTitle(option.titles)" />
          <UiButton
            v-if="open && session.viewer.participantName"
            :variant="session.viewer.votedSlug === option.slug ? 'secondary' : 'primary'"
            :disabled="session.viewer.votedSlug === option.slug"
            @click="attempt(() => vote(option.slug))"
          >
            {{ session.viewer.votedSlug === option.slug ? text('yourVote') : text('vote') }}
          </UiButton>
        </div>
      </section>

      <section class="vote-page__section">
        <h2 class="vote-page__heading">{{ text('participants') }}</h2>
        <p v-if="session.participants.length === 0" class="vote-page__intro">{{ text('noParticipants') }}</p>
        <ul v-else class="vote-people">
          <li v-for="(person, index) in session.participants" :key="index" class="vote-people__item">
            <UiAvatar :name="person.name" size="sm" />
            <span class="vote-people__name">{{ person.name }}</span>
            <UiBadge :tone="person.hasVoted ? 'success' : 'neutral'">{{ person.hasVoted ? text('voted') : text('notVoted') }}</UiBadge>
          </li>
        </ul>
      </section>

      <UiDialog v-model:open="closing" :title="text('closeTitle')" :description="text('closeText')" :close-label="text('closeLabel')">
        <template #footer>
          <UiButton variant="ghost" @click="closing = false">{{ text('cancel') }}</UiButton>
          <UiButton variant="danger" @click="confirmClose">{{ text('closeVote') }}</UiButton>
        </template>
      </UiDialog>
      <UiToast v-model:open="copied" tone="success" :title="text('linkCopied')" :description="text('linkCopiedText')" :close-label="text('closeLabel')" />
      <UiToast v-model:open="failed" tone="danger" :title="text('actionFailed')" :close-label="text('closeLabel')" />
    </template>
  </main>
</template>
