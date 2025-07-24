<template>
  <div v-if="recipeData" class="recipe-card">
    <div class="recipe-image">
      <img :src="recipeData?.steps[0]?.image || 'https://via.placeholder.com/300x200/E5E7EB/9CA3AF?text=No+Image'" :alt="recipeData?.title" />
      <div class="cuisine-badge" :style="{ background: getCuisineColor(recipe.cuisine) }">
        {{ recipe.cuisine }}
      </div>
    </div>
    <div class="recipe-content">
      <h3 class="recipe-title">{{ recipeData?.title }}</h3>
      <div class="ingredients-preview">
        <strong>{{ $t('ingredients') }} ({{ recipeData?.ingredients.length || 0 }}):</strong>
        <p class="ingredients-text">{{ ingredientsPreview }}</p>
      </div>
      <div class="steps-info">
        <span class="steps-count">{{ recipeData?.steps.length || 0 }} {{ $t('steps') }}</span>
      </div>
      <button class="view-recipe-btn" @click="$emit('view-recipe', recipe, currentLanguage)">
        {{ $t('viewRecipe') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme'
import type { Recipe, SupportedLanguage } from '../types/Recipe'

interface Props {
  recipe: Recipe
  currentLanguage: SupportedLanguage
}

const props = defineProps<Props>()
const { currentTheme } = useTheme()
const { t } = useI18n()

defineEmits<{
  'view-recipe': [recipe: Recipe, language: SupportedLanguage]
}>()

const recipeData = computed(() => {
  return props.recipe.languages[props.currentLanguage] || props.recipe.languages.en || Object.values(props.recipe.languages)[0]
})

const getCuisineColor = (cuisine: string): string => {
  // Theme-specific cuisine colors
  const themeColors: Record<string, Record<string, string>> = {
    'masculine-kawaii': {
      'Italian': 'linear-gradient(135deg, #4a90e2, #5ca7f2)',
      'Japanese': 'linear-gradient(135deg, #6c757d, #8b949e)',
      'Thai': 'linear-gradient(135deg, #28a745, #20c997)',
      'Indian': 'linear-gradient(135deg, #fd7e14, #ff8c00)',
      'Chinese': 'linear-gradient(135deg, #dc3545, #e74c3c)',
      'Korean': 'linear-gradient(135deg, #a29bfe, #74b9ff)',
      'French': 'linear-gradient(135deg, #495057, #6c757d)',
      'German': 'linear-gradient(135deg, #198754, #20c997)',
      'Romanian': 'linear-gradient(135deg, #0d6efd, #4a90e2)',
      'Unknown': 'linear-gradient(135deg, #4a90e2, #5ca7f2)'
    },
    'pink-kawaii': {
      'Italian': 'linear-gradient(135deg, #ffb3d9, #ff9ec7)',
      'Japanese': 'linear-gradient(135deg, #ffc0cb, #ffb6c1)',
      'Thai': 'linear-gradient(135deg, #ff69b4, #ff1493)',
      'Indian': 'linear-gradient(135deg, #ffd1dc, #ffb6c1)',
      'Chinese': 'linear-gradient(135deg, #ff69b4, #ff1493)',
      'Korean': 'linear-gradient(135deg, #dda0dd, #da70d6)',
      'French': 'linear-gradient(135deg, #f0c0d0, #e6b3cc)',
      'German': 'linear-gradient(135deg, #ff69b4, #ff1493)',
      'Romanian': 'linear-gradient(135deg, #dda0dd, #da70d6)',
      'Unknown': 'linear-gradient(135deg, #ffb3d9, #ff9ec7)'
    },
    'dark-mode': {
      'Italian': 'linear-gradient(135deg, #bb86fc, #9965f4)',
      'Japanese': 'linear-gradient(135deg, #03dac6, #00bfa5)',
      'Thai': 'linear-gradient(135deg, #4caf50, #2e7d32)',
      'Indian': 'linear-gradient(135deg, #ff9800, #f57c00)',
      'Chinese': 'linear-gradient(135deg, #f44336, #d32f2f)',
      'Korean': 'linear-gradient(135deg, #673ab7, #512da8)',
      'French': 'linear-gradient(135deg, #2196f3, #1976d2)',
      'German': 'linear-gradient(135deg, #e91e63, #c2185b)',
      'Romanian': 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
      'Unknown': 'linear-gradient(135deg, #bb86fc, #9965f4)'
    },
    'nature': {
      'Italian': 'linear-gradient(135deg, #8bc34a, #689f38)',
      'Japanese': 'linear-gradient(135deg, #4caf50, #388e3c)',
      'Thai': 'linear-gradient(135deg, #2e7d32, #1b5e20)',
      'Indian': 'linear-gradient(135deg, #ff9800, #f57c00)',
      'Chinese': 'linear-gradient(135deg, #795548, #5d4037)',
      'Korean': 'linear-gradient(135deg, #607d8b, #455a64)',
      'French': 'linear-gradient(135deg, #3f51b5, #303f9f)',
      'German': 'linear-gradient(135deg, #ff5722, #e64a19)',
      'Romanian': 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
      'Unknown': 'linear-gradient(135deg, #8bc34a, #689f38)'
    }
  }
  
  const colors = themeColors[currentTheme.value] || themeColors['masculine-kawaii']
  return colors[cuisine] || colors['Unknown']
}

const ingredientsPreview = computed(() => {
  const ingredients = recipeData.value?.ingredients || []
  if (ingredients.length <= 3) {
    return ingredients.join(', ')
  }
  return ingredients.slice(0, 3).join(', ') + `... +${ingredients.length - 3} ${t('more')}`
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

* {
  font-family: var(--theme-font-primary, 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

.recipe-card h3 {
  font-family: var(--theme-font-header, 'JetBrains Mono', 'Poppins', monospace) !important;
}

.recipe-card {
  background: var(--theme-card-gradient, linear-gradient(135deg, #fff 0%, #f8fafc 100%));
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 2px solid var(--theme-primary, #4a90e2);
  position: relative;
  animation: gentleFloat 4s ease-in-out infinite;
}

.recipe-card::before {
  content: var(--theme-primary-icon, '⚡');
  position: absolute;
  top: -5px;
  left: -5px;
  background: var(--theme-surface, #fff);
  color: var(--theme-primary, #4a90e2);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid var(--theme-primary, #4a90e2);
  z-index: 2;
  animation: pulse 2s ease-in-out infinite;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(74, 144, 226, 0.3);
  border-color: #3478d4;
}

.recipe-card:hover::before {
  animation: heartbeat 0.6s ease-in-out;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
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
  transition: transform 0.3s ease;
  filter: brightness(1.05) saturate(1.1);
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.cuisine-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 14px;
  border-radius: 25px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.recipe-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
}

.recipe-title {
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2d3748, #4a5568);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
  position: relative;
  font-family: 'Inter', sans-serif;
}

.recipe-title::after {
  content: '(◕‿◕)ゞ';
  position: absolute;
  right: 0;
  top: -8px;
  font-size: 0.6em;
  color: #4a90e2;
  opacity: 0.7;
}

.ingredients-preview {
  margin-bottom: 18px;
  flex: 1;
  background: rgba(248, 250, 252, 0.8);
  padding: 15px;
  border-radius: 20px;
  border: 2px solid rgba(74, 144, 226, 0.2);
  position: relative;
}

.ingredients-preview::before {
  content: '⚡';
  position: absolute;
  top: -8px;
  left: 15px;
  background: #fff;
  color: #4a90e2;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid #4a90e2;
}

.ingredients-preview strong {
  display: block;
  background: linear-gradient(135deg, #4a90e2, #3478d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
}

.ingredients-text {
  margin: 0;
  color: #2d3748;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 500;
}

.steps-info {
  margin-bottom: 18px;
  font-size: 12px;
}

.steps-count {
  background: linear-gradient(135deg, #4a90e2, #3478d4);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(74, 144, 226, 0.3);
  display: inline-block;
}

.view-recipe-btn {
  background: linear-gradient(135deg, #4a90e2, #3478d4);
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: stretch;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.view-recipe-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.view-recipe-btn:hover {
  background: linear-gradient(135deg, #3478d4, #2d69c4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.view-recipe-btn:hover::before {
  left: 100%;
}

.view-recipe-btn::after {
  content: ' (◕‿◕)ゞ';
  opacity: 0;
  transition: opacity 0.3s ease;
}

.view-recipe-btn:hover::after {
  opacity: 1;
}
</style>
