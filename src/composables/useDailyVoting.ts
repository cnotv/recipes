import { ref, computed, onUnmounted } from 'vue'
import type { Recipe } from '../types/Recipe'

// Types for the daily voting system
export interface VotingSession {
  id: string
  name: string
  code: string
  recipes: VotingRecipe[]
  createdAt: number
  expiresAt: number
  createdBy: string
}

export interface VotingRecipe extends Recipe {
  votes: number
}

export interface ConnectedUser {
  id: string
  name?: string
  hasVoted: boolean
}

export interface VoteMessage {
  type: 'vote' | 'join' | 'leave' | 'session_update'
  sessionCode?: string
  recipeUrl?: string
  userId?: string
  userName?: string
  session?: VotingSession
  users?: ConnectedUser[]
}

// Serverless function URL - this would be your deployed function
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'wss://your-websocket-server.com'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api.com'

// For demo purposes, we'll simulate the backend locally
const DEMO_MODE = !import.meta.env.VITE_API_BASE_URL

export function useDailyVoting() {
  // Reactive state
  const currentSession = ref<VotingSession | null>(null)
  const sessionCode = ref<string>('')
  const connectedUsers = ref<ConnectedUser[]>([])
  const userVote = ref<string | null>(null)
  const loading = ref(false)
  const error = ref('')
  const userId = ref(generateUserId())
  
  // WebSocket connection
  let websocket: WebSocket | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  
  // Generate unique user ID
  function generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  // Generate session code
  function generateSessionCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  // Simulate WebSocket connection for demo mode
  function simulateWebSocketConnection(): void {
    // For demo mode, we can't directly set isConnected since it's computed
    // The computed property checks websocket state, so we simulate that
    console.log('Demo mode: WebSocket connection simulated')
  }

  // WebSocket connection management
  const connectWebSocket = (sessionCode: string) => {
    if (websocket) {
      websocket.close()
    }

    try {
      websocket = new WebSocket(`${WEBSOCKET_URL}?session=${sessionCode}&user=${userId.value}`)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
        reconnectAttempts = 0
        
        // Send join message
        sendMessage({
          type: 'join',
          sessionCode,
          userId: userId.value
        })
      }
      
      websocket.onmessage = (event) => {
        try {
          const message: VoteMessage = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected')
        
        // Attempt to reconnect if not manually closed
        if (reconnectAttempts < maxReconnectAttempts && currentSession.value) {
          reconnectAttempts++
          setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts}`)
            connectWebSocket(sessionCode)
          }, 1000 * reconnectAttempts)
        }
      }
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (err) {
      console.error('Failed to connect WebSocket:', err)
      error.value = 'Failed to connect to voting session'
    }
  }

  const sendMessage = (message: VoteMessage) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message))
    }
  }

  const handleWebSocketMessage = (message: VoteMessage) => {
    switch (message.type) {
      case 'session_update':
        if (message.session) {
          currentSession.value = message.session
          sessionCode.value = message.session.code
        }
        if (message.users) {
          connectedUsers.value = message.users
        }
        break
        
      case 'vote':
        // Update vote counts in real-time
        if (currentSession.value && message.recipeUrl) {
          const recipe = currentSession.value.recipes.find(r => r.url === message.recipeUrl)
          if (recipe) {
            // Refresh session data from server
            refreshSessionData()
          }
        }
        break
    }
  }

  // API calls to serverless functions
  const createSession = async (name: string, recipes: Recipe[]): Promise<void> => {
    try {
      loading.value = true
      error.value = ''

      // Demo mode: simulate session creation locally
      if (DEMO_MODE) {
        const generatedCode = generateSessionCode()
        
        const session: VotingSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          code: generatedCode,
          recipes: recipes.map(recipe => ({
            ...recipe,
            votes: 0
          })),
          createdAt: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          createdBy: userId.value
        }

        currentSession.value = session
        sessionCode.value = session.code
        connectedUsers.value = [{
          id: userId.value,
          name: 'You',
          hasVoted: false
        }]
        
        // Simulate WebSocket connection
        simulateWebSocketConnection()
        return
      }

      // Real API call
      const response = await fetch(`${API_BASE_URL}/api/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          recipes: recipes.map(recipe => ({
            ...recipe,
            votes: 0
          })),
          userId: userId.value
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`)
      }

      const data = await response.json()
      currentSession.value = data.session
      sessionCode.value = data.session.code
      
      // Connect to WebSocket for real-time updates
      connectWebSocket(data.session.code)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create voting session'
      console.error('Error creating session:', err)
    } finally {
      loading.value = false
    }
  }

  const joinSession = async (code: string): Promise<void> => {
    try {
      loading.value = true
      error.value = ''

      // Demo mode: simulate joining (for demo, just show error)
      if (DEMO_MODE) {
        error.value = 'Demo mode: Create a new session instead of joining'
        loading.value = false
        return
      }

      // Real API call
      const response = await fetch(`${API_BASE_URL}/api/join-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          userId: userId.value
        })
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found or expired')
        }
        throw new Error(`Failed to join session: ${response.statusText}`)
      }

      const data = await response.json()
      currentSession.value = data.session
      sessionCode.value = code
      
      // Connect to WebSocket for real-time updates
      connectWebSocket(code)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to join voting session'
      console.error('Error joining session:', err)
    } finally {
      loading.value = false
    }
  }

  const voteForRecipe = async (recipeUrl: string): Promise<void> => {
    try {
      if (!currentSession.value) return
      
      // Demo mode: simulate voting locally
      if (DEMO_MODE) {
        const recipe = currentSession.value.recipes.find(r => r.url === recipeUrl)
        if (!recipe) return

        // Toggle vote logic
        if (userVote.value === recipeUrl) {
          // Remove vote
          userVote.value = null
          recipe.votes = Math.max(0, recipe.votes - 1)
        } else {
          // Remove previous vote if exists
          if (userVote.value) {
            const prevRecipe = currentSession.value.recipes.find(r => r.url === userVote.value)
            if (prevRecipe) {
              prevRecipe.votes = Math.max(0, prevRecipe.votes - 1)
            }
          }
          
          // Add new vote
          userVote.value = recipeUrl
          recipe.votes = recipe.votes + 1
        }

        // Update user status
        const user = connectedUsers.value.find(u => u.id === userId.value)
        if (user) {
          user.hasVoted = userVote.value !== null
        }
        
        return
      }

      // Real API call
      const response = await fetch(`${API_BASE_URL}/api/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionCode: sessionCode.value,
          recipeUrl,
          userId: userId.value
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to vote: ${response.statusText}`)
      }

      // Update local state optimistically
      userVote.value = userVote.value === recipeUrl ? null : recipeUrl
      
      // Send WebSocket message for real-time updates
      sendMessage({
        type: 'vote',
        sessionCode: sessionCode.value,
        recipeUrl,
        userId: userId.value
      })
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to vote'
      console.error('Error voting:', err)
    }
  }

  const leaveSession = (): void => {
    // Send leave message
    if (websocket && currentSession.value) {
      sendMessage({
        type: 'leave',
        sessionCode: sessionCode.value,
        userId: userId.value
      })
    }
    
    // Close WebSocket connection
    if (websocket) {
      websocket.close()
      websocket = null
    }
    
    // Reset state
    currentSession.value = null
    sessionCode.value = ''
    connectedUsers.value = []
    userVote.value = null
    error.value = ''
  }

  const refreshSessionData = async (): Promise<void> => {
    if (!sessionCode.value) return
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/${sessionCode.value}`)
      if (response.ok) {
        const data = await response.json()
        currentSession.value = data.session
        connectedUsers.value = data.users || []
      }
    } catch (err) {
      console.error('Failed to refresh session data:', err)
    }
  }

  const copySessionCode = async (): Promise<void> => {
    if (!sessionCode.value) return
    
    try {
      await navigator.clipboard.writeText(sessionCode.value)
      // You could add a toast notification here
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = sessionCode.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  // Computed properties
  const isConnected = computed(() => {
    return websocket?.readyState === WebSocket.OPEN
  })

  const hasVoted = computed(() => {
    return userVote.value !== null
  })

  // Cleanup on unmount
  onUnmounted(() => {
    leaveSession()
  })

  return {
    // State
    currentSession,
    sessionCode,
    connectedUsers,
    userVote,
    loading,
    error,
    isConnected,
    hasVoted,
    
    // Methods
    createSession,
    joinSession,
    voteForRecipe,
    leaveSession,
    copySessionCode,
    refreshSessionData
  }
}
