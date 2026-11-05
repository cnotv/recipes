import type { StoredRecipe } from './types.ts'

/** A link to another site; anything else is already ours or is not a link at all. */
export const isRemoteImage = (image: string): boolean => /^(https?:)?\/\//i.test(image)

/** What the API and the pages may show: our own pictures only, so no visit reaches another site. */
export const withoutRemoteImages = (recipe: StoredRecipe): StoredRecipe => ({
  ...recipe,
  coverImage: recipe.coverImage !== null && isRemoteImage(recipe.coverImage) ? null : recipe.coverImage,
  languages: Object.fromEntries(
    Object.entries(recipe.languages).map(([language, translation]) => [
      language,
      { ...translation, steps: translation.steps.map((step) => (isRemoteImage(step.image) ? { ...step, image: '' } : step)) },
    ]),
  ),
})
