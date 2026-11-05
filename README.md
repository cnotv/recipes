# Recipe Collection Vue App

A modern Vue 3 application with TypeScript that displays a multilingual recipe collection with pagination support. This app can dynamically load any JSON recipe files and display them in multiple languages.

## Features

- **Multi-language Support**: Display recipes in English, German, Japanese, and Thai
- **Pagination**: Navigate through recipes with easy-to-use pagination
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Recipe Details**: View detailed recipe information with step-by-step instructions and images
- **Dynamic Loading**: Automatically discovers and loads all recipe JSON files
- **Non-hardcoded File Discovery**: Uses an index-based system to find recipes dynamically

## Adding New Recipes

1. Create a JSON file in the `public/recipes/` directory with the following structure:

```json
{
  "url": "https://example.com/recipe-url",
  "languages": {
    "en": {
      "title": "Recipe Title in English",
      "ingredients": [
        "Ingredient 1",
        "Ingredient 2"
      ],
      "steps": [
        {
          "image": "optional-image-url.jpg",
          "content": "Step description"
        }
      ]
    },
    "de": {
      "title": "Recipe Title in German",
      "ingredients": ["German ingredients..."],
      "steps": [{"content": "German instructions..."}]
    }
  }
}
```

2. Run the index generation command to update the recipe list:

```bash
pnpm generate-index
```

This will automatically scan the `public/recipes/` directory and create an index file that the application uses to discover available recipes.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Generate recipe index (run this after adding new recipes)
pnpm generate-index

# Build for production
pnpm build
```
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
- pnpm 10 (`corepack enable` picks the version from `package.json`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

### Checks

```bash
pnpm lint --max-warnings 0
pnpm typecheck
pnpm test
```

CI runs the same three on every pull request and on pushes to `main`. Agent rules live in
`AGENTS.md`. `generate-index` and `build:recipes` are TypeScript scripts in `scripts/`, run
with `tsx`.

### Preview Production Build

```bash
pnpm preview
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

### Option 2: Update App Loading
The app automatically tries to load:
1. `/recipes.json` (main recipe file)
2. Individual files from `/recipes/` directory

Place any JSON files in the `public/recipes/` directory and the app will attempt to load them.

## Design

The design source is the Figma file [Recipes UI Kit](https://www.figma.com/design/EBtTaKaR1l2TwkdaOjplf8).
It has three pages: **Foundations** (variables and design notes), **Components** (icons,
Button, IconButton) and **Screens** (captured from the running code, see below).

**Variable collections** (each variable carries a web code syntax such as
`var(--color-bg-surface)`, so the Vue tokens can be exported from the file):

| Collection | Names | Notes |
| --- | --- | --- |
| Primitives | `neutral/*`, `indigo/*`, `matcha/*`, `saffron/*`, `berry/*` | Raw colour scales, hidden from pickers |
| Color | `color/bg/*`, `color/text/*`, `color/border/*` | Semantic, aliases to Primitives, one mode (Light) |
| Spacing | `space/0` to `space/16` | 4px steps |
| Radius | `radius/sm` to `radius/full` | 6, 10, 16, 24, 999 |
| Size | `size/control-*`, `size/icon-*`, `size/avatar-*`, `size/border*` | Control, icon and stroke sizes |
| Typography | `font/family/*`, `font/size/*`, `font/line/*` | Font families, sizes and line heights |

**Text styles** (bound to the typography variables): `display/4xl`, `heading/3xl`,
`heading/2xl`, `heading/xl`, `body/lg`, `body/md`, `body/sm`, `label/md`, `label/sm`,
`caption/xs`. There is also one effect style, `shadow/raised`.

**Direction.** Bricolage Grotesque for headings and Hanken Grotesk for body text (both are
Google fonts and must be self-hosted, never loaded from Google). The palette is an indigo ink
brand with matcha for success, saffron for highlights such as a vote winner, and berry for
danger.

**Decisions**
- The kawaii theme switcher is dropped. Four gradient and emoji themes multiply the token
  surface, make contrast hard to guarantee, and cannot be expressed as one coherent set of
  semantic tokens. The site has one brand, in light and dark.
- Dark mode is defined in code (issue 4), not in Figma, because the Figma Starter plan allows
  one variable mode per collection.
- The rest of the UI kit and all screens are built in Vue first and captured into the
  Screens page with `generate_figma_design` (issue 4), because the Figma tool quota on the
  Starter plan is spent.

## Technology Stack

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server
- **CSS**: Modern responsive styling

## Browser Support

This application supports all modern browsers that support ES2015+ features.
