import { onMounted } from 'vue'

export interface MetaData {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  structuredData?: any
}

const BASE_URL = 'https://cnotv-recipes.netlify.app'
const SITE_NAME = 'Recipe Collections'

// Global function to update meta tags with new data
export function updateMetaTags(meta: MetaData) {
  // Update title
  if (meta.title) {
    document.title = meta.title.includes(SITE_NAME) 
      ? meta.title 
      : `${SITE_NAME} - ${meta.title}`
  }

  // Update meta tags
  const updateMetaTag = (name: string, content: string, property = false) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    let tag = document.querySelector(selector) as HTMLMetaElement
    
    if (!tag) {
      tag = document.createElement('meta')
      if (property) {
        tag.setAttribute('property', name)
      } else {
        tag.setAttribute('name', name)
      }
      document.head.appendChild(tag)
    }
    tag.content = content
  }

  // Update canonical link
  const updateCanonical = (url: string) => {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }

  // Update structured data
  const updateStructuredData = (data: any, id = 'structured-data') => {
    // Remove existing structured data
    const existing = document.getElementById(id)
    if (existing) {
      existing.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.textContent = JSON.stringify(data, null, 2)
    document.head.appendChild(script)
  }

  // Basic meta tags
  if (meta.description) {
    updateMetaTag('description', meta.description)
  }
  if (meta.keywords) {
    updateMetaTag('keywords', meta.keywords)
  }

  // Open Graph tags
  if (meta.ogTitle) {
    updateMetaTag('og:title', meta.ogTitle, true)
  }
  if (meta.ogDescription) {
    updateMetaTag('og:description', meta.ogDescription, true)
  }
  if (meta.ogImage) {
    updateMetaTag('og:image', meta.ogImage, true)
  }
  if (meta.ogUrl) {
    updateMetaTag('og:url', meta.ogUrl, true)
  }

  // Twitter tags
  if (meta.twitterTitle) {
    updateMetaTag('twitter:title', meta.twitterTitle, true)
  }
  if (meta.twitterDescription) {
    updateMetaTag('twitter:description', meta.twitterDescription, true)
  }
  if (meta.twitterImage) {
    updateMetaTag('twitter:image', meta.twitterImage, true)
  }

  // Canonical URL
  if (meta.canonical) {
    updateCanonical(meta.canonical)
  }

  // Structured data
  if (meta.structuredData) {
    updateStructuredData(meta.structuredData)
  }
}

export function useMeta(meta: MetaData) {
  const updateMeta = () => {
    updateMetaTags(meta)
  }

  onMounted(updateMeta)

  return {
    updateMeta
  }
}

// Helper function to create recipe meta data
export function createRecipeMeta(recipe: {
  title?: string
  description?: string
  image?: string
  cuisine?: string
  fileName?: string
  ingredients?: string[]
  steps?: Array<{ content: string; image?: string }>
  url?: string
  cookTime?: string
  prepTime?: string
  totalTime?: string
  servings?: string
}) {
  const recipeTitle = recipe.title || 'Recipe'
  const recipeDescription = recipe.description || `Delicious ${recipe.cuisine || ''} recipe with step-by-step instructions.`
  const recipeUrl = recipe.fileName 
    ? `${BASE_URL}/recipe/${encodeURIComponent(recipe.fileName.replace('.json', ''))}`
    : BASE_URL
  
  // Create structured data for recipe
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipeTitle,
    "description": recipeDescription,
    "image": recipe.image || `${BASE_URL}/og-image.jpg`,
    "url": recipeUrl,
    "author": {
      "@type": "Organization",
      "name": SITE_NAME
    },
    "datePublished": new Date().toISOString(),
    "recipeCategory": recipe.cuisine || "International",
    "recipeCuisine": recipe.cuisine || "International",
    "recipeIngredient": recipe.ingredients || [],
    "recipeInstructions": recipe.steps?.map((step, index) => ({
      "@type": "HowToStep",
      "name": `Step ${index + 1}`,
      "text": step.content,
      "image": step.image
    })) || [],
    "nutrition": {
      "@type": "NutritionInformation"
    }
  }

  // Add timing information if available
  if (recipe.cookTime) {
    structuredData.cookTime = recipe.cookTime
  }
  if (recipe.prepTime) {
    structuredData.prepTime = recipe.prepTime
  }
  if (recipe.totalTime) {
    structuredData.totalTime = recipe.totalTime
  }
  if (recipe.servings) {
    structuredData.recipeYield = recipe.servings
  }

  return {
    title: recipeTitle,
    description: recipeDescription,
    keywords: `${recipe.cuisine || ''} recipe, cooking, ${recipeTitle}, food, instructions`,
    ogTitle: `${SITE_NAME} - ${recipeTitle}`,
    ogDescription: recipeDescription,
    ogImage: recipe.image || `${BASE_URL}/og-image.jpg`,
    ogUrl: recipeUrl,
    twitterTitle: `${SITE_NAME} - ${recipeTitle}`,
    twitterDescription: recipeDescription,
    twitterImage: recipe.image || `${BASE_URL}/og-image.jpg`,
    canonical: recipeUrl,
    structuredData
  }
}

// Helper function for home page meta
export function createHomeMeta() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "description": "Curated collection of international recipes with step-by-step instructions",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  return {
    title: SITE_NAME,
    description: 'Explore our curated collection of international recipes including Japanese, Italian, Indian, Thai, Chinese cuisine and more. Step-by-step instructions in multiple languages.',
    keywords: 'recipes, cooking, international cuisine, Japanese recipes, Italian recipes, Indian recipes, Thai recipes, food, cooking instructions, multilingual recipes',
    ogTitle: SITE_NAME,
    ogDescription: 'Explore our curated collection of international recipes including Japanese, Italian, Indian, Thai, Chinese cuisine and more.',
    ogImage: `${BASE_URL}/og-image.jpg`,
    ogUrl: BASE_URL,
    twitterTitle: SITE_NAME,
    twitterDescription: 'Explore our curated collection of international recipes including Japanese, Italian, Indian, Thai, Chinese cuisine and more.',
    twitterImage: `${BASE_URL}/og-image.jpg`,
    canonical: BASE_URL,
    structuredData
  }
}
