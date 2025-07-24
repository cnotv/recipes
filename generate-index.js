#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the recipes directory path
const recipesDir = path.join(__dirname, 'public', 'recipes');

// Function to scan for JSON files and create index
function generateRecipeIndex() {
  try {
    // Read all files in the recipes directory
    const files = fs.readdirSync(recipesDir);
    
    // Filter for JSON files, excluding index.json and recipes.json
    const recipeFiles = files.filter(file => 
      file.endsWith('.json') && 
      file !== 'index.json' && 
      file !== 'recipes.json'
    );
    
    // Write the index file
    const indexPath = path.join(recipesDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(recipeFiles, null, 2));
    
    console.log(`Generated recipe index with ${recipeFiles.length} files:`);
    recipeFiles.forEach(file => console.log(`  - ${file}`));
    
  } catch (error) {
    console.error('Error generating recipe index:', error);
    process.exit(1);
  }
}

// Run the function
generateRecipeIndex();
