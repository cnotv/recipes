# Recipe Collection Vue App

A modern Vue 3 application with TypeScript that displays a multilingual recipe collection with pagination support. This app can dynamically load any JSON recipe files and display them in multiple languages.

## Features

- **Multi-language Support**: Display recipes in English, German, Japanese, and Thai
- **Pagination**: Navigate through recipes with easy-to-use pagination
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Recipe Details**: View detailed recipe information with step-by-step instructions and images
- **SQLite Backed**: A small TypeScript server stores the recipes and serves them under `/api`

## Adding New Recipes

Recipes live in a SQLite database. The files in `server/seed/recipes/` are imported once, when the
database has no recipes yet. A file has this structure:

```json
{
  "url": "https://example.com/recipe-url",
  "languages": {
    "en": {
      "title": "Recipe Title in English",
      "ingredients": ["Ingredient 1", "Ingredient 2"],
      "steps": [{ "image": "optional-image-url.jpg", "content": "Step description" }]
    },
    "de": {
      "title": "Recipe Title in German",
      "ingredients": ["German ingredients..."],
      "steps": [{ "content": "German instructions..." }]
    }
  }
}
```

The Netlify build (`pnpm build:static`) writes JSON from the same files, so a new file shows up there too.

## Development

```bash
# Install dependencies
pnpm install

# Start the API (port 4330) and the UI (port 5173)
pnpm dev

# Build the UI, then serve it and /api from one process
pnpm build && pnpm start
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

The application will be available at `http://localhost:5173`; it proxies `/api` to the server on port 4330.

### Building for Production

```bash
pnpm build && pnpm start        # one process on http://localhost:4330
docker compose up --build --wait  # same, in a container on 127.0.0.1:4330
pnpm build:static                # data free build for Netlify previews
```

### Checks

```bash
pnpm lint --max-warnings 0
pnpm typecheck
pnpm test
```

CI runs the same three on every pull request and on pushes to `main`. Agent rules live in
`AGENTS.md`.

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

server/                    # Hono API, SQLite migrations, seed recipes
scripts/                   # Recipe metadata helpers, static data build
```

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
