<template>
  <div class="recipe-card">
    <div class="recipe-image">
      <img :src="recipeData.steps[0]?.image || 'https://via.placeholder.com/300x200/E5E7EB/9CA3AF?text=No+Image'" :alt="recipeData.title" />
      <div class="language-badge">
        {{ currentLanguage.toUpperCase() }}
      </div>
    </div>
    <div class="recipe-content">
      <h3 class="recipe-title">{{ recipeData.title }}</h3>
      <div class="ingredients-preview">
        <strong>Ingredients ({{ recipeData.ingredients.length }}):</strong>
        <p class="ingredients-text">{{ ingredientsPreview }}</p>
      </div>
      <div class="steps-info">
        <span class="steps-count">{{ recipeData.steps.length }} steps</span>
      </div>
      <button class="view-recipe-btn" @click="$emit('view-recipe', recipe, currentLanguage)">
        View Recipe
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe, SupportedLanguage } from '../types/Recipe'

interface Props {
  recipe: Recipe
  currentLanguage: SupportedLanguage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'view-recipe': [recipe: Recipe, language: SupportedLanguage]
}>()

const recipeData = computed(() => {
  return props.recipe.languages[props.currentLanguage] || props.recipe.languages.en || Object.values(props.recipe.languages)[0]
})

const ingredientsPreview = computed(() => {
  const ingredients = recipeData.value?.ingredients || []
  if (ingredients.length <= 3) {
    return ingredients.join(', ')
  }
  return ingredients.slice(0, 3).join(', ') + `... +${ingredients.length - 3} more`
})
</script>

<style scoped>
.recipe-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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

.language-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #3b82f6;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recipe-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-title {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.ingredients-preview {
  margin-bottom: 16px;
  flex: 1;
}

.ingredients-preview strong {
  display: block;
  color: #374151;
  font-size: 14px;
  margin-bottom: 4px;
}

.ingredients-text {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

.steps-info {
  margin-bottom: 16px;
  font-size: 12px;
  color: #6b7280;
}

.steps-count {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.view-recipe-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: stretch;
}

.view-recipe-btn:hover {
  background: #2563eb;
}
</style>

<style scoped>
.recipe-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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

.difficulty-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty-easy {
  background: #10b981;
  color: white;
}

.difficulty-medium {
  background: #f59e0b;
  color: white;
}

.difficulty-hard {
  background: #ef4444;
  color: white;
}

.recipe-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-title {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.recipe-description {
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 500;
}

.category {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 6px;
}

.servings {
  color: #6b7280;
}

.recipe-times {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #6b7280;
}

.prep-time, .cook-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon {
  font-size: 14px;
}

.view-recipe-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: stretch;
}

.view-recipe-btn:hover {
  background: #2563eb;
}
</style>
