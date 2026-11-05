<script setup lang="ts">
import { computed } from 'vue'
import { legalLanguage } from '../../scripts/seo.ts'
import { useLanguagePreference } from '../composables/useLanguagePreference'
import { datenschutz } from '../legal/datenschutz'
import { impressum } from '../legal/impressum'
import type { LegalPage } from '../legal/types'

const props = defineProps<{ page: LegalPage }>()

const { currentLanguage } = useLanguagePreference()

// The pages exist in German and English; every other interface language reads the English text.
const language = computed(() => legalLanguage(currentLanguage.value))
const document = computed(() => (props.page === 'impressum' ? impressum : datenschutz)[language.value])
</script>

<template>
  <article class="legal-view" :lang="language">
    <h1 class="page-title">{{ document.title }}</h1>
    <p class="legal-view__updated">{{ document.updated }}</p>
    <section v-for="section in document.sections" :key="section.heading" class="legal-view__section">
      <h2 class="section-title">{{ section.heading }}</h2>
      <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      <ul v-if="section.items">
        <li v-for="item in section.items" :key="item">{{ item }}</li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.legal-view {
  display: grid;
  gap: var(--space-5);
  max-width: 48rem;
  margin: 0 auto;
}

.legal-view__updated {
  color: var(--color-text-secondary);
}

.legal-view__section {
  display: grid;
  gap: var(--space-3);
}

.legal-view__section ul {
  display: grid;
  gap: var(--space-2);
  padding-left: var(--space-5);
}

.legal-view__section p,
.legal-view__section li {
  overflow-wrap: anywhere;
}
</style>
