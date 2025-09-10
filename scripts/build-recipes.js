import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const RECIPES_DIR = path.join(__dirname, '../public/recipes')
const BUILD_DIR = path.join(__dirname, '../public')
const STATIC_DATA_DIR = path.join(BUILD_DIR, 'static-data')

// Supported languages
const LANGUAGES = ['en', 'de', 'jp', 'th']

// Build-time recipe processing
async function buildRecipes() {
  console.log('🔨 Building recipes with SSR and metadata...')
  
  try {
    // Ensure output directory exists
    await fs.ensureDir(STATIC_DATA_DIR)
    
    // Read recipe index
    const indexPath = path.join(RECIPES_DIR, 'index.json')
    const recipeFiles = await fs.readJson(indexPath)
    
    console.log(`📚 Processing ${recipeFiles.length} recipes...`)
    
    // Process all recipes
    const recipes = []
    const cuisineMap = new Map()
    const languageStats = { en: 0, de: 0, jp: 0, th: 0 }
    
    for (const filename of recipeFiles) {
      try {
        const recipePath = path.join(RECIPES_DIR, filename)
        const recipe = await fs.readJson(recipePath)
        
        // Generate metadata for each recipe
        const processedRecipe = await processRecipe(recipe, filename)
        recipes.push(processedRecipe)
        
        // Build cuisine mapping
        if (recipe.cuisine) {
          if (!cuisineMap.has(recipe.cuisine)) {
            cuisineMap.set(recipe.cuisine, [])
          }
          cuisineMap.get(recipe.cuisine).push(processedRecipe.id)
        }
        
        // Count language availability
        Object.keys(recipe.languages || {}).forEach(lang => {
          if (languageStats[lang] !== undefined) {
            languageStats[lang]++
          }
        })
        
        // Generate individual recipe metadata files
        await generateRecipeMetadata(processedRecipe)
        
      } catch (error) {
        console.warn(`⚠️  Error processing ${filename}:`, error.message)
      }
    }
    
    // Sort recipes by various criteria
    const recipesByDate = [...recipes].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    const recipesByCuisine = groupByCuisine(recipes)
    const recipesByDifficulty = groupByDifficulty(recipes)
    
    // Generate static data files
    await generateStaticData({
      allRecipes: recipes,
      recipesByDate,
      recipesByCuisine,
      recipesByDifficulty,
      cuisineMap: Object.fromEntries(cuisineMap),
      languageStats,
      totalRecipes: recipes.length,
      buildTime: new Date().toISOString()
    })
    
    // Generate SEO meta tags for each recipe
    await generateSEOMetadata(recipes)
    
    // Generate sitemap
    await generateSitemap(recipes)
    
    console.log('✅ Recipe build completed successfully!')
    console.log(`📊 Statistics:`)
    console.log(`   - Total recipes: ${recipes.length}`)
    console.log(`   - Cuisines: ${cuisineMap.size}`)
    console.log(`   - Languages: ${Object.entries(languageStats).map(([lang, count]) => `${lang}: ${count}`).join(', ')}`)
    
  } catch (error) {
    console.error('❌ Recipe build failed:', error)
    process.exit(1)
  }
}

// Process individual recipe with metadata generation
async function processRecipe(recipe, filename) {
  const id = filename.replace('.json', '')
  const slug = generateSlug(recipe)
  
  // Extract primary language data
  const primaryLang = recipe.languages?.en || recipe.languages?.[Object.keys(recipe.languages)[0]] || {}
  
  // Generate comprehensive metadata
  const metadata = {
    id,
    slug,
    filename,
    url: recipe.url,
    cuisine: recipe.cuisine,
    languages: Object.keys(recipe.languages || {}),
    
    // SEO data
    title: primaryLang.title || 'Unknown Recipe',
    description: generateDescription(primaryLang),
    keywords: generateKeywords(recipe, primaryLang),
    
    // Recipe analytics
    stepCount: primaryLang.steps?.length || 0,
    ingredientCount: primaryLang.ingredients?.length || 0,
    estimatedTime: estimateTime(primaryLang),
    difficulty: estimateDifficulty(primaryLang),
    
    // Preview data for homepage
    ingredientPreview: (primaryLang.ingredients || []).slice(0, 3),
    
    // Image data
    images: extractImages(primaryLang),
    featuredImage: primaryLang.steps?.[0]?.image || null,
    
    // Dates
    dateAdded: recipe.dateAdded || new Date().toISOString(),
    lastModified: new Date().toISOString(),
    
    // Build-time computed data
    searchText: generateSearchText(recipe),
    tags: generateTags(recipe, primaryLang)
  }
  
  return {
    ...recipe,
    metadata
  }
}

// Generate recipe description for SEO
function generateDescription(recipeData) {
  if (recipeData.description) return recipeData.description
  
  const title = recipeData.title || 'Recipe'
  const ingredientCount = recipeData.ingredients?.length || 0
  const stepCount = recipeData.steps?.length || 0
  
  return `Learn how to make ${title}. This recipe includes ${ingredientCount} ingredients and ${stepCount} detailed steps.`
}

// Generate SEO keywords
function generateKeywords(recipe, recipeData) {
  const keywords = new Set()
  
  // Add cuisine
  if (recipe.cuisine) keywords.add(recipe.cuisine.toLowerCase())
  
  // Add title words
  if (recipeData.title) {
    recipeData.title.split(/\s+/).forEach(word => {
      if (word.length > 3) keywords.add(word.toLowerCase())
    })
  }
  
  // Add ingredient keywords
  recipeData.ingredients?.forEach(ingredient => {
    const words = ingredient.split(/\s+/)
    words.forEach(word => {
      if (word.length > 3) keywords.add(word.toLowerCase())
    })
  })
  
  keywords.add('recipe')
  keywords.add('cooking')
  keywords.add('food')
  
  return Array.from(keywords).slice(0, 15).join(', ')
}

// Generate URL slug
function generateSlug(recipe) {
  const primaryLang = recipe.languages?.en || recipe.languages?.[Object.keys(recipe.languages)[0]] || {}
  const title = primaryLang.title || 'recipe'
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Estimate cooking time
function estimateTime(recipeData) {
  const steps = recipeData.steps || []
  let totalMinutes = 0
  
  // Basic estimation: 5 minutes per step + ingredient prep time
  totalMinutes += steps.length * 5
  totalMinutes += (recipeData.ingredients?.length || 0) * 2
  
  // Look for time mentions in steps
  steps.forEach(step => {
    const stepContent = typeof step === 'string' ? step : step.content || ''
    const timeMatch = stepContent.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i)
    if (timeMatch) {
      const value = parseInt(timeMatch[1])
      const unit = timeMatch[2].toLowerCase()
      if (unit.includes('hour') || unit.includes('hr')) {
        totalMinutes += value * 60
      } else {
        totalMinutes += value
      }
    }
  })
  
  return Math.max(totalMinutes, 15) // Minimum 15 minutes
}

// Estimate difficulty level
function estimateDifficulty(recipeData) {
  const steps = recipeData.steps?.length || 0
  const ingredients = recipeData.ingredients?.length || 0
  
  // Complex cooking techniques
  const complexTerms = ['fold', 'whisk', 'braise', 'flambé', 'tempering', 'sous vide']
  const stepsText = (recipeData.steps || []).join(' ').toLowerCase()
  const complexTechniques = complexTerms.filter(term => stepsText.includes(term)).length
  
  let difficulty = 1 // Easy
  
  if (steps > 8 || ingredients > 12 || complexTechniques > 2) {
    difficulty = 3 // Hard
  } else if (steps > 5 || ingredients > 8 || complexTechniques > 0) {
    difficulty = 2 // Medium
  }
  
  return ['Easy', 'Medium', 'Hard'][difficulty - 1]
}

// Extract all images from recipe
function extractImages(recipeData) {
  const images = []
  
  recipeData.steps?.forEach((step, index) => {
    if (step.image) {
      images.push({
        url: step.image,
        alt: `Step ${index + 1}`,
        step: index + 1
      })
    }
  })
  
  return images
}

// Generate search text for full-text search
function generateSearchText(recipe) {
  const searchParts = []
  
  Object.values(recipe.languages || {}).forEach(lang => {
    if (lang.title) searchParts.push(lang.title)
    if (lang.description) searchParts.push(lang.description)
    if (lang.ingredients) searchParts.push(...lang.ingredients)
    if (lang.steps) {
      // Handle both string array and object array formats
      const stepTexts = lang.steps.map(step => 
        typeof step === 'string' ? step : step.content || ''
      )
      searchParts.push(...stepTexts)
    }
  })
  
  if (recipe.cuisine) searchParts.push(recipe.cuisine)
  
  return searchParts.join(' ').toLowerCase()
}

// Generate tags for categorization
function generateTags(recipe, recipeData) {
  const tags = []
  
  // Cuisine tag
  if (recipe.cuisine) tags.push(recipe.cuisine)
  
  // Time-based tags
  const time = estimateTime(recipeData)
  if (time <= 30) tags.push('Quick')
  if (time <= 15) tags.push('Fast')
  if (time >= 120) tags.push('Slow Cook')
  
  // Ingredient-based tags
  const ingredientText = (recipeData.ingredients || []).join(' ').toLowerCase()
  if (ingredientText.includes('vegetarian') || (!ingredientText.includes('meat') && !ingredientText.includes('chicken') && !ingredientText.includes('beef'))) {
    tags.push('Vegetarian')
  }
  if (ingredientText.includes('vegan')) tags.push('Vegan')
  if (ingredientText.includes('gluten-free') || ingredientText.includes('gluten free')) tags.push('Gluten-Free')
  
  // Difficulty tag
  tags.push(estimateDifficulty(recipeData))
  
  return [...new Set(tags)]
}

// Group recipes by cuisine
function groupByCuisine(recipes) {
  const groups = {}
  
  recipes.forEach(recipe => {
    const cuisine = recipe.cuisine || 'Other'
    if (!groups[cuisine]) groups[cuisine] = []
    groups[cuisine].push(recipe.metadata.id)
  })
  
  return groups
}

// Group recipes by difficulty
function groupByDifficulty(recipes) {
  const groups = { Easy: [], Medium: [], Hard: [] }
  
  recipes.forEach(recipe => {
    const difficulty = recipe.metadata.difficulty
    if (groups[difficulty]) {
      groups[difficulty].push(recipe.metadata.id)
    }
  })
  
  return groups
}

// Generate static data files
async function generateStaticData(data) {
  console.log('📝 Generating static data files...')
  
  // Main recipe index
  await fs.writeJson(path.join(STATIC_DATA_DIR, 'recipes-index.json'), {
    recipes: data.allRecipes.map(r => r.metadata),
    totalCount: data.totalRecipes,
    buildTime: data.buildTime
  }, { spaces: 2 })
  
  // Recipes by cuisine
  await fs.writeJson(path.join(STATIC_DATA_DIR, 'recipes-by-cuisine.json'), data.recipesByCuisine, { spaces: 2 })
  
  // Recipes by difficulty
  await fs.writeJson(path.join(STATIC_DATA_DIR, 'recipes-by-difficulty.json'), data.recipesByDifficulty, { spaces: 2 })
  
  // Language statistics
  await fs.writeJson(path.join(STATIC_DATA_DIR, 'language-stats.json'), data.languageStats, { spaces: 2 })
  
  // Search index
  const searchIndex = data.allRecipes.map(recipe => ({
    id: recipe.metadata.id,
    title: recipe.metadata.title,
    cuisine: recipe.cuisine,
    searchText: recipe.metadata.searchText,
    tags: recipe.metadata.tags
  }))
  await fs.writeJson(path.join(STATIC_DATA_DIR, 'search-index.json'), searchIndex, { spaces: 2 })
}

// Generate individual recipe metadata files
async function generateRecipeMetadata(recipe) {
  const metadataDir = path.join(STATIC_DATA_DIR, 'recipes')
  await fs.ensureDir(metadataDir)
  
  await fs.writeJson(
    path.join(metadataDir, `${recipe.metadata.id}-meta.json`),
    recipe.metadata,
    { spaces: 2 }
  )
}

// Generate SEO metadata for each recipe
async function generateSEOMetadata(recipes) {
  console.log('🔍 Generating SEO metadata...')
  
  const seoDir = path.join(STATIC_DATA_DIR, 'seo')
  await fs.ensureDir(seoDir)
  
  for (const recipe of recipes) {
    const seoData = {
      title: `${recipe.metadata.title} - Recipe Collection`,
      description: recipe.metadata.description,
      keywords: recipe.metadata.keywords,
      canonical: `/recipe/${recipe.metadata.slug}`,
      openGraph: {
        title: recipe.metadata.title,
        description: recipe.metadata.description,
        image: recipe.metadata.featuredImage,
        type: 'article',
        url: `/recipe/${recipe.metadata.slug}`
      },
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.metadata.title,
        description: recipe.metadata.description,
        image: recipe.metadata.images.map(img => img.url),
        recipeCategory: recipe.cuisine,
        recipeCuisine: recipe.cuisine,
        totalTime: `PT${recipe.metadata.estimatedTime}M`,
        recipeYield: '4 servings',
        recipeIngredient: recipe.languages?.en?.ingredients || [],
        recipeInstructions: (recipe.languages?.en?.steps || []).map(step => ({
          '@type': 'HowToStep',
          text: step
        }))
      }
    }
    
    await fs.writeJson(
      path.join(seoDir, `${recipe.metadata.id}.json`),
      seoData,
      { spaces: 2 }
    )
  }
}

// Generate sitemap
async function generateSitemap(recipes) {
  console.log('🗺️ Generating sitemap...')
  
  const baseUrl = 'https://your-domain.com' // Update with your domain
  const currentDate = new Date().toISOString().split('T')[0]
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/daily-vote</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`

  recipes.forEach(recipe => {
    sitemap += `
  <url>
    <loc>${baseUrl}/recipe/${recipe.metadata.slug}</loc>
    <lastmod>${recipe.metadata.lastModified.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  })

  sitemap += '\n</urlset>'
  
  await fs.writeFile(path.join(BUILD_DIR, 'sitemap.xml'), sitemap)
}

// Run the build process
buildRecipes().catch(console.error)
