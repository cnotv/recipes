<template>
  <div class="vote-component">
    <div class="vote-buttons">
      <button 
        class="vote-btn upvote-btn"
        :class="{ active: voteData.userVote === 'up' }"
        @click="handleVote('up')"
        :title="$t('vote.upvote')"
      >
        👍
        <span class="vote-count">{{ voteData.upvotes }}</span>
      </button>
      
      <button 
        class="vote-btn downvote-btn"
        :class="{ active: voteData.userVote === 'down' }"
        @click="handleVote('down')"
        :title="$t('vote.downvote')"
      >
        👎
        <span class="vote-count">{{ voteData.downvotes }}</span>
      </button>
    </div>
    
    <div v-if="showTotalScore" class="vote-score">
      <span class="score-label">{{ $t('vote.score') }}:</span>
      <span class="score-value" :class="{ positive: voteData.score > 0, negative: voteData.score < 0 }">
        {{ voteData.score > 0 ? '+' : '' }}{{ voteData.score }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVoting } from '../composables/useVoting'

interface Props {
  recipeUrl: string
  showTotalScore?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTotalScore: false,
  compact: false
})

const { getVotesForRecipe, vote } = useVoting()

const voteData = getVotesForRecipe(props.recipeUrl)

const handleVote = (voteType: 'up' | 'down') => {
  vote(props.recipeUrl, voteType)
}
</script>

<style scoped>
.vote-component {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.vote-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.vote-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid transparent;
  border-radius: 1rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 3rem;
  justify-content: center;
}

.vote-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upvote-btn {
  border-color: var(--color-success);
}

.upvote-btn:hover {
  background: var(--color-success);
  color: white;
}

.upvote-btn.active {
  background: var(--color-success);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.downvote-btn {
  border-color: var(--color-danger);
}

.downvote-btn:hover {
  background: var(--color-danger);
  color: white;
}

.downvote-btn.active {
  background: var(--color-danger);
  color: white;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.vote-count {
  font-weight: 600;
  font-size: 0.8rem;
}

.vote-score {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.score-label {
  font-weight: 500;
}

.score-value {
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border-radius: 0.3rem;
  background: var(--color-surface-variant);
}

.score-value.positive {
  color: var(--color-success);
  background: rgba(76, 175, 80, 0.1);
}

.score-value.negative {
  color: var(--color-danger);
  background: rgba(244, 67, 54, 0.1);
}

/* Compact mode for recipe cards */
.vote-component.compact .vote-buttons {
  gap: 0.25rem;
}

.vote-component.compact .vote-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  min-width: 2.5rem;
}

.vote-component.compact .vote-count {
  font-size: 0.7rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .vote-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    min-width: 2.5rem;
  }
  
  .vote-count {
    font-size: 0.7rem;
  }
  
  .vote-score {
    font-size: 0.7rem;
  }
}
</style>
