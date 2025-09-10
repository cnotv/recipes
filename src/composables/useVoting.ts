import { ref, computed } from 'vue'

// Types for voting system
export interface Vote {
  upvotes: number
  downvotes: number
  userVotes: Record<string, 'up' | 'down'>
}

export interface VoteData {
  [recipeUrl: string]: Vote
}

// Storage keys
const VOTES_STORAGE_KEY = 'recipe-votes'
const USER_ID_KEY = 'voting-user-id'

// Generate a unique user ID for this browser session
function generateUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

// Load votes from localStorage
function loadVotes(): VoteData {
  try {
    const stored = localStorage.getItem(VOTES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading votes:', error)
    return {}
  }
}

// Save votes to localStorage
function saveVotes(votes: VoteData): void {
  try {
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes))
  } catch (error) {
    console.error('Error saving votes:', error)
  }
}

// Global reactive state
const votes = ref<VoteData>(loadVotes())
const currentUserId = generateUserId()

export function useVoting() {
  // Get votes for a specific recipe
  const getVotesForRecipe = (recipeUrl: string) => {
    return computed(() => {
      const recipeVotes = votes.value[recipeUrl] || {
        upvotes: 0,
        downvotes: 0,
        userVotes: {}
      }
      
      return {
        upvotes: recipeVotes.upvotes,
        downvotes: recipeVotes.downvotes,
        totalVotes: recipeVotes.upvotes + recipeVotes.downvotes,
        userVote: recipeVotes.userVotes[currentUserId] || null,
        score: recipeVotes.upvotes - recipeVotes.downvotes
      }
    })
  }

  // Vote for a recipe
  const vote = (recipeUrl: string, voteType: 'up' | 'down') => {
    if (!votes.value[recipeUrl]) {
      votes.value[recipeUrl] = {
        upvotes: 0,
        downvotes: 0,
        userVotes: {}
      }
    }

    const recipeVotes = votes.value[recipeUrl]
    const currentVote = recipeVotes.userVotes[currentUserId]

    // Remove previous vote if exists
    if (currentVote === 'up') {
      recipeVotes.upvotes = Math.max(0, recipeVotes.upvotes - 1)
    } else if (currentVote === 'down') {
      recipeVotes.downvotes = Math.max(0, recipeVotes.downvotes - 1)
    }

    // Add new vote if different from current
    if (currentVote !== voteType) {
      if (voteType === 'up') {
        recipeVotes.upvotes++
      } else {
        recipeVotes.downvotes++
      }
      recipeVotes.userVotes[currentUserId] = voteType
    } else {
      // Remove vote if same as current (toggle off)
      delete recipeVotes.userVotes[currentUserId]
    }

    // Save to localStorage
    saveVotes(votes.value)
  }

  // Remove user's vote
  const removeVote = (recipeUrl: string) => {
    if (!votes.value[recipeUrl]) return

    const recipeVotes = votes.value[recipeUrl]
    const currentVote = recipeVotes.userVotes[currentUserId]

    if (currentVote === 'up') {
      recipeVotes.upvotes = Math.max(0, recipeVotes.upvotes - 1)
    } else if (currentVote === 'down') {
      recipeVotes.downvotes = Math.max(0, recipeVotes.downvotes - 1)
    }

    delete recipeVotes.userVotes[currentUserId]
    saveVotes(votes.value)
  }

  // Get all votes (for debugging or admin purposes)
  const getAllVotes = () => {
    return computed(() => votes.value)
  }

  // Clear all votes (for testing)
  const clearAllVotes = () => {
    votes.value = {}
    saveVotes({})
  }

  return {
    getVotesForRecipe,
    vote,
    removeVote,
    getAllVotes,
    clearAllVotes,
    currentUserId
  }
}
