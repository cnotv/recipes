import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { headForPath, htmlLang, renderHeadTags } from '../../scripts/seo.ts'
import type { HeadModel } from '../../scripts/seo-types.ts'
import { useLanguagePreference } from './useLanguagePreference'

/** Replaces the tags the server (or the previous page) put in the head, and sets the language of the document. */
export const applyHead = (head: HeadModel): void => {
  document.head.querySelectorAll('[data-head]').forEach((node) => node.remove())
  const template = document.createElement('template')
  template.innerHTML = renderHeadTags(head)
  document.head.append(template.content)
  document.documentElement.lang = htmlLang(head.lang)
}

/** The address the page is served from, so canonical links are right on any host. */
export const siteOrigin = (): string => window.location.origin

/** Keeps the head in step with the route for every page that needs no data; a recipe page sets its own. */
export const useRouteHead = (): void => {
  const route = useRoute()
  const { currentLanguage } = useLanguagePreference()
  watch(
    [() => route.path, currentLanguage],
    () => {
      const page = headForPath(route.path, currentLanguage.value, siteOrigin())
      if (page !== undefined) applyHead(page.head)
    },
    { immediate: true },
  )
}
