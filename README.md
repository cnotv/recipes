# Recipe Collection Vue App

A modern Vue 3 application with TypeScript that displays a multilingual recipe collection with pagination support. This app can load any JSON files from the root folder and display recipes in multiple languages.

## Features

- **Multi-language Support**: Display recipes in English, German, Japanese, and Thai
- **Pagination**: Navigate through recipes with easy-to-use pagination
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Recipe Details**: View detailed recipe information with step-by-step instructions and images
- **Dynamic Loading**: Automatically loads any JSON files from the public folder

## JSON Structure

The application expects JSON files with the following structure:

```json
{
  "url": "the original URL",
  "languages": {
    "en": {
      "title": "Recipe name",
      "ingredients": ["10g of ingredient X"],
      "steps": [
        {
          "image": "path or data64",
          "content": "the step instruction here"
        }
      ]
    },
    "de": {
      "title": "Recipe name in German",
      "ingredients": ["10g of ingredient X"],
      "steps": [
        {
          "image": "path or data64", 
          "content": "the step instruction in German"
        }
      ]
    }
    // ... other languages (jp, th)
  }
}
```

## Getting Started

### Prerequisites

- Node.js (version 20.19.0 or higher recommended)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── RecipeCard.vue      # Individual recipe card component
│   ├── RecipeModal.vue     # Detailed recipe view modal
│   └── Pagination.vue      # Pagination controls
├── types/
│   └── Recipe.ts          # TypeScript interfaces
├── App.vue                # Main application component
└── main.ts               # Application entry point

public/
└── recipes.json          # Sample recipe data
```

## Adding New Recipes

### Option 1: Direct Format
Place your JSON files in the `public/` directory using this structure:

```json
[
  {
    "url": "the original URL",
    "languages": {
      "en": {
        "title": "Recipe name",
        "ingredients": ["10g of ingredient X"],
        "steps": [
          {
            "image": "path or data64",
            "content": "the step instruction here"
          }
        ]
      }
    }
  }
]
```

### Option 2: Convert Existing Files
If you have files in the format with an `output` wrapper (like your current JSON file), use the conversion script:

```bash
node convert-recipe.js "public/recipes/Your Recipe File.json"
```

This will create a converted file that the app can load automatically.

### Option 3: Update App Loading
The app automatically tries to load:
1. `/recipes.json` (main recipe file)
2. Individual files from `/recipes/` directory

Place any JSON files in the `public/recipes/` directory and the app will attempt to load them.

## Technology Stack

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server
- **CSS**: Modern responsive styling

## Browser Support

This application supports all modern browsers that support ES2015+ features.
