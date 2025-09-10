<template>
  <div class="daily-vote-page">
    <header class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="goBackToHome">
          <span class="back-arrow">←</span>
          <span class="back-text">{{ $t('backToHome') }}</span>
        </button>
        
        <div class="center-controls">
          <KawaiiSelector
            v-model="currentTheme"
            :options="themeOptions"
            :label="$t('theme')"
            @update:model-value="(value) => setTheme(value as any)"
          />
        </div>

        <div class="header-controls">
          <KawaiiSelector
            v-model="currentLanguage"
            :options="languageOptions"
            :label="$t('language')"
            @update:model-value="updateLanguage"
          />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="voting-header">
        <h1 class="voting-title">{{ $t('dailyVote.title') }}</h1>
        
        <div class="voting-info">
          <div class="vote-stats">
            <span class="total-votes">{{ totalVotes }} {{ $t('dailyVote.totalVotes') }}</span>
            <span class="time-remaining">{{ timeRemaining }}</span>
          </div>
          
          <div class="session-code" v-if="sessionCode">
            <span class="code-label">{{ $t('dailyVote.sessionCode') }}:</span>
            <span class="code-value">{{ sessionCode }}</span>
            <button class="copy-code-btn" @click="copySessionCode" :title="$t('dailyVote.copyCode')">
              📋
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>{{ $t('loading') }}...</span>
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="voting-content">
        <!-- Join Existing Session -->
        <div v-if="!currentSession" class="join-session">
          <h2>{{ $t('dailyVote.joinSession') }}</h2>
          
          <div class="join-form">
            <input 
              v-model="joinCode" 
              type="text" 
              :placeholder="$t('dailyVote.enterCode')"
              class="join-input"
              @keyup.enter="joinVotingSession"
            />
            <button 
              class="join-btn" 
              @click="joinVotingSession"
              :disabled="!joinCode.trim()"
            >
              {{ $t('dailyVote.joinBtn') }}
            </button>
          </div>
        </div>

        <!-- Create New Session -->
        <div v-if="!currentSession" class="create-session">
          <div class="session-form">
            <h2>{{ $t('dailyVote.createSession') }}</h2>
            
            <div class="form-group">
              <label>{{ $t('dailyVote.sessionName') }}</label>
              <div class="input-with-button">
                <input 
                  v-model="newSessionName" 
                  type="text" 
                  :placeholder="$t('dailyVote.sessionNamePlaceholder')"
                  class="session-input"
                />
                <button 
                  class="create-btn" 
                  @click="createVotingSession"
                  :disabled="selectedRecipes.length < 2 || !newSessionName.trim()"
                >
                  {{ $t('dailyVote.createSessionBtn') }}
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <div class="recipe-header">
                <label>{{ $t('dailyVote.selectRecipes') }}</label>
                <div class="selection-controls">
                  <button 
                    class="select-all-btn"
                    @click="selectAllRecipes"
                    :disabled="selectedRecipes.length === availableRecipes.length"
                  >
                    Select All
                  </button>
                  <button 
                    class="clear-all-btn"
                    @click="clearAllRecipes"
                    :disabled="selectedRecipes.length === 0"
                  >
                    Clear All
                  </button>
                  <span class="selection-count">
                    {{ selectedRecipes.length }} / {{ availableRecipes.length }} selected
                  </span>
                </div>
              </div>
              <div class="recipe-selection">
                <div 
                  v-for="recipe in availableRecipes" 
                  :key="recipe.url"
                  class="recipe-option"
                  :class="{ selected: selectedRecipes.includes(recipe.url) }"
                  @click="toggleRecipeSelection(recipe.url)"
                >
                  <img 
                    :src="getRecipeImage(recipe)" 
                    :alt="getRecipeTitle(recipe)"
                    class="recipe-thumbnail"
                  />
                  <div class="recipe-details">
                    <span class="recipe-name">{{ getRecipeTitle(recipe) }}</span>
                    <span class="recipe-cuisine">{{ recipe.cuisine }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Voting Session -->
        <div v-else class="active-session">
          <div class="session-header">
            <h2>{{ currentSession.name }}</h2>
            <div class="session-controls">
              <button class="leave-btn" @click="leaveSession">
                {{ $t('dailyVote.leaveSession') }}
              </button>
            </div>
          </div>

          <div class="voting-recipes">
            <div 
              v-for="recipe in currentSession.recipes" 
              :key="recipe.url"
              class="voting-recipe-card"
              :class="{ 
                voted: userVote === recipe.url,
                winning: recipe.votes === maxVotes && maxVotes > 0
              }"
              @click="voteForRecipe(recipe.url)"
            >
              <div class="recipe-image">
                <img 
                  :src="getRecipeImage(recipe)" 
                  :alt="getRecipeTitle(recipe)"
                />
                <div class="vote-indicator" v-if="userVote === recipe.url">
                  ✓
                </div>
              </div>
              
              <div class="recipe-info">
                <h3 class="recipe-title">{{ getRecipeTitle(recipe) }}</h3>
                <p class="recipe-cuisine">{{ recipe.cuisine }}</p>
                
                <div class="vote-stats">
                  <div class="vote-count">
                    <span class="votes">{{ recipe.votes || 0 }}</span>
                    <span class="votes-label">{{ $t('dailyVote.votes') }}</span>
                  </div>
                  
                  <div class="vote-percentage" v-if="totalVotes > 0">
                    {{ Math.round((recipe.votes || 0) / totalVotes * 100) }}%
                  </div>
                </div>
                
                <div class="vote-bar">
                  <div 
                    class="vote-fill" 
                    :style="{ width: totalVotes > 0 ? (recipe.votes || 0) / totalVotes * 100 + '%' : '0%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connected Users -->
          <div class="connected-users" v-if="connectedUsers.length > 0">
            <h3>{{ $t('dailyVote.connectedUsers') }} ({{ connectedUsers.length }})</h3>
            <div class="users-list">
              <div 
                v-for="user in connectedUsers" 
                :key="user.id"
                class="user-item"
              >
                <span class="user-name">{{ user.name || $t('dailyVote.anonymousUser') }}</span>
                <span class="user-status" :class="{ voted: user.hasVoted }">
                  {{ user.hasVoted ? $t('dailyVote.voted') : $t('dailyVote.notVoted') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useLanguagePreference } from '../composables/useLanguagePreference'
import { useDailyVoting } from '../composables/useDailyVoting'
import KawaiiSelector from '../components/KawaiiSelector.vue'
import type { Recipe } from '../types/Recipe'

const router = useRouter()
const { currentLanguage, getLanguageName } = useLanguagePreference()
const { currentTheme, setTheme, availableThemes } = useTheme()
const { 
  currentSession,
  sessionCode,
  connectedUsers,
  userVote,
  loading,
  error,
  createSession,
  joinSession,
  leaveSession,
  voteForRecipe,
  copySessionCode
} = useDailyVoting()

// Form data
const newSessionName = ref('')
const selectedRecipes = ref<string[]>([])
const joinCode = ref('')
const availableRecipes = ref<Recipe[]>([])

// Theme and language options
const themeOptions = computed(() => 
  availableThemes.map((themeKey: string) => ({
    value: themeKey,
    label: themeKey === 'masculine-kawaii' ? 'Blue Kawaii' :
           themeKey === 'pink-kawaii' ? 'Pink Kawaii' :
           themeKey === 'dark-mode' ? 'Dark Mode' :
           themeKey === 'nature' ? 'Nature' : themeKey
  }))
)

const languageOptions = computed(() => [
  { value: 'en', label: getLanguageName('en') },
  { value: 'de', label: getLanguageName('de') },
  { value: 'jp', label: getLanguageName('jp') },
  { value: 'th', label: getLanguageName('th') }
])

// Computed properties
const totalVotes = computed(() => {
  if (!currentSession.value?.recipes) return 0
  return currentSession.value.recipes.reduce((total: number, recipe: any) => total + (recipe.votes || 0), 0)
})

const maxVotes = computed(() => {
  if (!currentSession.value?.recipes) return 0
  return Math.max(...currentSession.value.recipes.map((recipe: any) => recipe.votes || 0))
})

const timeRemaining = computed(() => {
  if (!currentSession.value?.expiresAt) return ''
  const now = Date.now()
  const expires = currentSession.value.expiresAt
  const remaining = expires - now
  
  if (remaining <= 0) return 'Expired'
  
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  } else {
    return `${minutes}m remaining`
  }
})

// Methods
const loadAvailableRecipes = async () => {
  try {
    loading.value = true
    
    // Load the recipe index first
    const indexResponse = await fetch('/recipes/index.json')
    if (!indexResponse.ok) {
      throw new Error('Failed to load recipe index')
    }
    
    const recipeFiles = await indexResponse.json()
    if (!Array.isArray(recipeFiles)) {
      throw new Error('Invalid recipe index format')
    }
    
    // Load all recipes (limit to first 20 for performance in voting)
    const recipes: Recipe[] = []
    const maxRecipes = Math.min(recipeFiles.length, 20)
    
    for (let i = 0; i < maxRecipes; i++) {
      try {
        const response = await fetch(`/recipes/${recipeFiles[i]}`)
        if (response.ok) {
          const recipe = await response.json()
          if (recipe && recipe.url) {
            recipes.push(recipe)
          }
        }
      } catch (err) {
        console.log(`Failed to load ${recipeFiles[i]}:`, err)
      }
    }
    
    availableRecipes.value = recipes
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load recipes'
    console.error('Failed to load recipes:', err)
  } finally {
    loading.value = false
  }
}

const getRecipeImage = (recipe: Recipe) => {
  const recipeData = recipe.languages[currentLanguage.value] || 
                    recipe.languages.en || 
                    Object.values(recipe.languages)[0]
  
  return recipeData?.steps?.[0]?.image || 'https://via.placeholder.com/300x200/E5E7EB/9CA3AF?text=No+Image'
}

const getRecipeTitle = (recipe: Recipe) => {
  const recipeData = recipe.languages[currentLanguage.value] || 
                    recipe.languages.en || 
                    Object.values(recipe.languages)[0]
  
  return recipeData?.title || 'Unknown Recipe'
}

const toggleRecipeSelection = (recipeUrl: string) => {
  const index = selectedRecipes.value.indexOf(recipeUrl)
  if (index > -1) {
    selectedRecipes.value.splice(index, 1)
  } else {
    selectedRecipes.value.push(recipeUrl)
  }
}

const selectAllRecipes = () => {
  selectedRecipes.value = availableRecipes.value.map(recipe => recipe.url)
}

const clearAllRecipes = () => {
  selectedRecipes.value = []
}

const createVotingSession = async () => {
  if (selectedRecipes.value.length < 2 || !newSessionName.value.trim()) {
    return
  }
  
  const sessionRecipes = availableRecipes.value.filter(recipe => 
    selectedRecipes.value.includes(recipe.url)
  )
  
  await createSession(newSessionName.value.trim(), sessionRecipes)
}

const joinVotingSession = async () => {
  if (!joinCode.value.trim()) return
  await joinSession(joinCode.value.trim())
}

const updateLanguage = () => {
  // Language change handling if needed
}

const goBackToHome = () => {
  router.push({
    name: 'home',
    query: { lang: currentLanguage.value }
  })
}

// Lifecycle
onMounted(() => {
  loadAvailableRecipes()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

.daily-vote-page {
  min-height: 100vh;
  background: var(--theme-bg-gradient, linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 25%, #f5f7fa 50%, #eef2f7 75%, #f8fafc 100%));
}

.page-header {
  background: var(--theme-surface, #fff);
  border-bottom: 2px solid var(--theme-border, #e2e8f0);
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}

.center-controls {
  display: flex;
  justify-content: center;
}

.header-controls {
  display: flex;
  justify-content: end;
}

.center-controls .kawaii-selector,
.header-controls .kawaii-selector {
  min-width: 140px;
  max-width: 180px;
}

.back-btn {
  background: var(--theme-button-gradient, linear-gradient(135deg, #4a90e2, #3478d4));
  border: 2px solid var(--theme-primary, #4a90e2);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  justify-self: start;
}

.back-btn:hover {
  background: var(--theme-accent, linear-gradient(135deg, #3478d4, #2d69c4));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.main-content {
  padding: 40px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.voting-header {
  text-align: center;
  margin-bottom: 40px;
}

.voting-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--theme-text, #2d3748);
  margin-bottom: 12px;
  font-family: 'JetBrains Mono', monospace;
}

.voting-subtitle {
  font-size: 1.2rem;
  color: var(--theme-text-secondary, #6b7280);
  margin-bottom: 24px;
}

.voting-info {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.vote-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.total-votes, .time-remaining {
  background: var(--theme-surface, #fff);
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid var(--theme-border, #e2e8f0);
  font-weight: 600;
  color: var(--theme-primary, #4a90e2);
}

.session-code {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--theme-surface, #fff);
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid var(--theme-border, #e2e8f0);
}

.code-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--theme-primary, #4a90e2);
  background: var(--theme-background, #f8fafc);
  padding: 4px 8px;
  border-radius: 8px;
}

.copy-code-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.copy-code-btn:hover {
  background: var(--theme-background, #f8fafc);
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--theme-border, #e2e8f0);
  border-top: 4px solid var(--theme-primary, #4a90e2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.create-session, .join-session {
  background: var(--theme-surface, #fff);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 30px rgba(74, 144, 226, 0.1);
  border: 2px solid var(--theme-border, #e2e8f0);
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--theme-text, #2d3748);
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.recipe-header label {
  margin-bottom: 0;
  flex-shrink: 0;
}

.selection-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.select-all-btn, .clear-all-btn {
  background: var(--theme-secondary, #6c757d);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-all-btn {
  background: var(--theme-success, #28a745);
}

.select-all-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.clear-all-btn:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.select-all-btn:disabled, .clear-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selection-count {
  font-size: 12px;
  color: var(--theme-text-secondary, #6b7280);
  font-weight: 600;
  padding: 6px 8px;
  background: var(--theme-background, #f8fafc);
  border-radius: 12px;
}

.session-input, .join-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--theme-border, #e2e8f0);
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.input-with-button {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-with-button .session-input {
  flex: 1;
}

.session-input:focus, .join-input:focus {
  outline: none;
  border-color: var(--theme-primary, #4a90e2);
}

.recipe-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  border: 2px solid var(--theme-border, #e2e8f0);
  border-radius: 12px;
  background: var(--theme-background, #f8fafc);
}

.recipe-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: var(--theme-surface, #fff);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.recipe-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.1);
}

.recipe-option.selected {
  border-color: var(--theme-primary, #4a90e2);
  background: var(--theme-primary-bg, #e3f2fd);
}

.recipe-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.recipe-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.recipe-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--theme-text, #2d3748);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-cuisine {
  font-size: 11px;
  color: var(--theme-text-secondary, #6b7280);
  background: var(--theme-background, #f8fafc);
  padding: 2px 6px;
  border-radius: 6px;
  width: fit-content;
}

.create-btn, .join-btn {
  background: var(--theme-button-gradient, linear-gradient(135deg, #4a90e2, #3478d4));
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-btn:hover, .join-btn:hover {
  background: var(--theme-accent, linear-gradient(135deg, #3478d4, #2d69c4));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.create-btn:disabled, .join-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.join-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.join-input {
  flex: 1;
}

.active-session {
  background: var(--theme-surface, #fff);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 30px rgba(74, 144, 226, 0.1);
  border: 2px solid var(--theme-border, #e2e8f0);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--theme-border, #e2e8f0);
}

.leave-btn {
  background: var(--theme-danger, #dc3545);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.leave-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.voting-recipes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.voting-recipe-card {
  background: var(--theme-surface, #fff);
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid var(--theme-border, #e2e8f0);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.voting-recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(74, 144, 226, 0.2);
}

.voting-recipe-card.voted {
  border-color: var(--theme-success, #28a745);
  box-shadow: 0 4px 20px rgba(40, 167, 69, 0.2);
}

.voting-recipe-card.winning {
  border-color: var(--theme-warning, #ffc107);
  box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3);
}

.recipe-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vote-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--theme-success, #28a745);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.recipe-info {
  padding: 20px;
}

.recipe-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--theme-text, #2d3748);
  margin-bottom: 8px;
}

.recipe-cuisine {
  color: var(--theme-text-secondary, #6b7280);
  margin-bottom: 16px;
}

.vote-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.vote-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.votes {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--theme-primary, #4a90e2);
}

.votes-label {
  font-size: 0.9rem;
  color: var(--theme-text-secondary, #6b7280);
}

.vote-percentage {
  font-weight: 600;
  color: var(--theme-text, #2d3748);
}

.vote-bar {
  height: 8px;
  background: var(--theme-background, #f8fafc);
  border-radius: 4px;
  overflow: hidden;
}

.vote-fill {
  height: 100%;
  background: var(--theme-primary, #4a90e2);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.connected-users {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid var(--theme-border, #e2e8f0);
}

.users-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--theme-background, #f8fafc);
  border-radius: 8px;
  border: 1px solid var(--theme-border, #e2e8f0);
}

.user-status.voted {
  color: var(--theme-success, #28a745);
  font-weight: 600;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .header-content {
    grid-template-columns: auto 1fr auto;
    gap: 8px;
  }
  
  .center-controls .kawaii-selector,
  .header-controls .kawaii-selector {
    min-width: 100px;
    max-width: 120px;
  }
  
  .back-btn .back-text {
    display: none;
  }
  
  .voting-title {
    font-size: 2rem;
  }
  
  .voting-info {
    flex-direction: column;
    gap: 16px;
  }
  
  .create-session, .join-session, .active-session {
    padding: 20px;
  }
  
  .recipe-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .selection-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .input-with-button {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-with-button .session-input {
    margin-bottom: 12px;
  }
  
  .recipe-selection {
    grid-template-columns: 1fr;
    padding: 0;
    border: none;
    background: none;
  }
  
  .join-form {
    flex-direction: column;
  }
  
  .join-input {
    margin-bottom: 12px;
  }
  
  .voting-recipes {
    grid-template-columns: 1fr;
  }
  
  .session-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>
