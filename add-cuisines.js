#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recipe cuisine mapping based on file names and content analysis
const recipeCuisines = {
  "Caponata di verdure - Ricetta di Misya.json": "Italian",
  "Gyudon (Japanese Beef Rice Bowl) (Video) 牛丼 • Just One Cookbook.json": "Japanese",
  "Khua Kling Recipe - Thai Dry Meat Curry (วิธีทำคั่วกลิ้งหมู).json": "Thai",
  "Kitsune Udon きつねうどん • Just One Cookbook.json": "Japanese",
  "Lamb Curry Recipe - Swasthi's Recipes.json": "Indian",
  "Massaman Curry Meatballs Recipe - Hot Thai Kitchen!.json": "Thai",
  "Mazesoba (Mazemen) 台湾まぜそば • Just One Cookbook.json": "Japanese",
  "Okonomiyaki Recipe お好み焼き • Just One Cookbook.json": "Japanese",
  "Omurice (Omelette Rice) - My Korean Kitchen.json": "Korean",
  "Ricetta Parmigiana di melanzane - La Ricetta di GialloZafferano.json": "Italian",
  "Ricetta Quiche Lorraine - La Ricetta di GialloZafferano.json": "French",
  "Ricetta Saltimbocca alla romana - La Ricetta di GialloZafferano.json": "Italian",
  "Ricetta Scaloppine al limone - La Ricetta di GialloZafferano.json": "Italian",
  "Ricetta Spezzatino di vitello con patate - La Ricetta di GialloZafferano.json": "Italian",
  "Ricetta Spätzle di spinaci con speck e panna - La Ricetta di GialloZafferano.json": "German",
  "Ricetta Tiella barese (riso patate e cozze) - La Ricetta di GialloZafferano.json": "Italian",
  "Ricetta Zuppa di farro e borlotti - La Ricetta di GialloZafferano.json": "Italian",
  "Saag Wala Chicken or Palak Chicken (How to make Palak Chicken).json": "Indian",
  "Steamed bao buns (baozi, 包子), a complete guide - Red House Spice.json": "Chinese",
  "The Best Chicken Tikka Masala Recipe Out There - Cafe Delites.json": "Indian",
  "Varză a la Cluj rețetă veche, prezentată amănunțit _ Laura Laurențiu.json": "Romanian"
};

function addCuisineToRecipes() {
  const recipesDir = path.join(__dirname, 'public', 'recipes');
  
  for (const [fileName, cuisine] of Object.entries(recipeCuisines)) {
    const filePath = path.join(recipesDir, fileName);
    
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const recipe = JSON.parse(fileContent);
        
        // Add cuisine field if it doesn't exist
        if (!recipe.cuisine) {
          recipe.cuisine = cuisine;
          
          // Write back to file with proper formatting
          fs.writeFileSync(filePath, JSON.stringify(recipe, null, 2));
          console.log(`✅ Added cuisine "${cuisine}" to ${fileName}`);
        } else {
          console.log(`⏭️  Cuisine already exists for ${fileName}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message);
      }
    } else {
      console.log(`⚠️  File not found: ${fileName}`);
    }
  }
}

addCuisineToRecipes();
