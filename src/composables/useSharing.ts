import { ref } from 'vue'

// Types for sharing system
export interface VotingSession {
  recipeUrl: string
  createdAt: number
  expiresAt: number
}

export interface VotingSessions {
  [sessionId: string]: VotingSession
}

// Storage key
const VOTING_SESSIONS_KEY = 'voting-sessions'

// Session expiration time (24 hours)
const SESSION_DURATION = 24 * 60 * 60 * 1000

// Load sessions from localStorage
function loadSessions(): VotingSessions {
  try {
    const stored = localStorage.getItem(VOTING_SESSIONS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading voting sessions:', error)
    return {}
  }
}

// Save sessions to localStorage
function saveSessions(sessions: VotingSessions): void {
  try {
    localStorage.setItem(VOTING_SESSIONS_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving voting sessions:', error)
  }
}

// Clean up expired sessions
function cleanupExpiredSessions(sessions: VotingSessions): VotingSessions {
  const now = Date.now()
  const validSessions: VotingSessions = {}
  
  for (const [sessionId, session] of Object.entries(sessions)) {
    if (session.expiresAt > now) {
      validSessions[sessionId] = session
    }
  }
  
  return validSessions
}

// Generate a unique session ID
function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 12) + Date.now().toString(36)
}

export function useSharing() {
  const sessions = ref<VotingSessions>(cleanupExpiredSessions(loadSessions()))
  const isShareModalOpen = ref(false)
  const currentShareUrl = ref('')

  // Create a shareable voting URL for a recipe
  const createVotingSession = (recipeUrl: string): string => {
    const sessionId = generateSessionId()
    const now = Date.now()
    
    const session: VotingSession = {
      recipeUrl,
      createdAt: now,
      expiresAt: now + SESSION_DURATION
    }

    sessions.value[sessionId] = session
    saveSessions(sessions.value)

    // Generate the shareable URL
    const baseUrl = window.location.origin
    const encodedRecipeUrl = encodeURIComponent(recipeUrl)
    return `${baseUrl}/recipe/${encodedRecipeUrl}?vote=${sessionId}`
  }

  // Get session details by session ID
  const getSession = (sessionId: string): VotingSession | null => {
    const session = sessions.value[sessionId]
    
    if (!session) {
      return null
    }

    // Check if session has expired
    if (session.expiresAt <= Date.now()) {
      delete sessions.value[sessionId]
      saveSessions(sessions.value)
      return null
    }

    return session
  }

  // Check if a URL parameter contains a valid voting session
  const getVotingSessionFromUrl = (): VotingSession | null => {
    const urlParams = new URLSearchParams(window.location.search)
    const voteSessionId = urlParams.get('vote')
    
    if (!voteSessionId) {
      return null
    }

    return getSession(voteSessionId)
  }

  // Open share modal with generated URL
  const openShareModal = (recipeUrl: string) => {
    const shareUrl = createVotingSession(recipeUrl)
    currentShareUrl.value = shareUrl
    isShareModalOpen.value = true
  }

  // Close share modal
  const closeShareModal = () => {
    isShareModalOpen.value = false
    currentShareUrl.value = ''
  }

  // Copy URL to clipboard
  const copyToClipboard = async (url: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (fallbackError) {
        console.error('Failed to copy to clipboard:', fallbackError)
        return false
      }
    }
  }

  // Clean up expired sessions manually
  const cleanupSessions = () => {
    sessions.value = cleanupExpiredSessions(sessions.value)
    saveSessions(sessions.value)
  }

  // Get all active sessions (for debugging)
  const getAllSessions = () => {
    return sessions.value
  }

  return {
    createVotingSession,
    getSession,
    getVotingSessionFromUrl,
    openShareModal,
    closeShareModal,
    copyToClipboard,
    cleanupSessions,
    getAllSessions,
    isShareModalOpen,
    currentShareUrl
  }
}
