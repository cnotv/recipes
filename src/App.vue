<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PwaStatus from './components/PwaStatus.vue'
import UiFooter from './ui/UiFooter.vue'
import UiHeader from './ui/UiHeader.vue'
import UiSelect from './ui/UiSelect.vue'
import { isSupportedLanguage, supportedLanguages, useLanguagePreference } from './composables/useLanguagePreference'
import { useRouteHead } from './composables/useHead'
import { themeModes, useTheme } from './composables/useTheme'

const { t } = useI18n()
const { currentLanguage, getLanguageName, setLanguage } = useLanguagePreference()
const { mode, setMode } = useTheme()
useRouteHead()

const languageOptions = computed(() => supportedLanguages.map((value) => ({ value, label: getLanguageName(value) })))
const themeOptions = computed(() => themeModes.map((value) => ({ value, label: t(value) })))

const chooseLanguage = (value: string | undefined) => {
  if (isSupportedLanguage(value)) setLanguage(value)
}

const chooseTheme = (value: string | undefined) => {
  const chosen = themeModes.find((candidate) => candidate === value)
  if (chosen) setMode(chosen)
}
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">{{ t('skipToContent') }}</a>
    <UiHeader :brand="t('recipeCollection')">
      <router-link class="app-nav-link" to="/">{{ t('home') }}</router-link>
      <router-link class="app-nav-link" to="/vote/new">{{ t('navVote') }}</router-link>
      <router-link class="app-nav-link" to="/submit">{{ t('navSubmit') }}</router-link>
      <template #actions>
        <UiSelect
          :label="t('language')"
          :options="languageOptions"
          :model-value="currentLanguage"
          @update:model-value="chooseLanguage"
        />
        <UiSelect :label="t('theme')" :options="themeOptions" :model-value="mode" @update:model-value="chooseTheme" />
      </template>
    </UiHeader>
    <PwaStatus />
    <main id="main" class="app-main"><router-view /></main>
    <UiFooter>
      <template #note>{{ t('footerNote') }}</template>
    </UiFooter>
  </div>
</template>
