#!/usr/bin/env node

/**
 * Recipe File Converter
 * 
 * This script helps convert recipe files from the original format to the format expected by the Vue app.
 * Usage: node convert-recipe.js <input-file> [output-file]
 */

const fs = require('fs');
const path = require('path');

function convertRecipeFile(inputFile, outputFile) {
  try {
    // Read the input file
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(rawData);
    
    const convertedRecipes = [];
    
    // Process each recipe in the array
    for (const item of data) {
      if (item.output && item.output.url && item.output.languages) {
        convertedRecipes.push({
          url: item.output.url,
          cuisine: item.output.cuisine || 'Unknown',
          languages: item.output.languages
        });
      } else if (item.url && item.languages) {
        // Already in correct format
        convertedRecipes.push({
          url: item.url,
          cuisine: item.cuisine || 'Unknown',
          languages: item.languages
        });
      }
    }
    
    // Write the converted data
    const outputPath = outputFile || inputFile.replace('.json', '-converted.json');
    fs.writeFileSync(outputPath, JSON.stringify(convertedRecipes, null, 2));
    
    console.log(`✅ Successfully converted ${convertedRecipes.length} recipes`);
    console.log(`📁 Output file: ${outputPath}`);
    
    return convertedRecipes;
  } catch (error) {
    console.error('❌ Error converting recipe file:', error.message);
    process.exit(1);
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node convert-recipe.js <input-file> [output-file]');
    console.log('Example: node convert-recipe.js ./recipes/my-recipe.json');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }
  
  convertRecipeFile(inputFile, outputFile);
}

module.exports = { convertRecipeFile };
