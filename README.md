# Recipe Collection Vue App

A modern Vue 3 application with TypeScript that displays a multilingual recipe collection with pagination support. This app can dynamically load any JSON recipe files and display them in multiple languages.

## Features

- **Multi-language Support**: Display recipes in English, German, Japanese, and Thai
- **Pagination**: Navigate through recipes with easy-to-use pagination
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Recipe Details**: View detailed recipe information with step-by-step instructions and images
- **Shared Votes**: Start a vote at `/vote/new`, share the `/vote/<id>` link, and watch the tallies move live (Server-Sent Events); needs the server, so the static preview shows a notice instead
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

## Submitting recipes

`/submit` takes a recipe link. The server reads its schema.org `Recipe` JSON-LD, or asks an OpenRouter free model to extract the
recipe when the page has none, translates it into en, de, jp and th, and holds it as pending. `/admin` lists pending recipes for
approval or rejection (a rejected link is never imported twice).

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | Enables model extraction and translation. Without it JSON-LD pages still import, untranslated. |
| `OPENROUTER_MODEL` | Default `google/gemma-4-31b-it:free` (262k context). Free model ids rotate; see https://openrouter.ai/api/v1/models. |
| `RECIPES_ADMIN_TOKEN` | 16 characters or more; signs in `/admin`. Unset disables admin. |
| `RECIPES_TRUST_PROXY` | `true` behind the reverse proxy, so the per address rate limit uses the address the proxy appended. |

Limits: 5 submissions per address per hour, 10 admin sign in attempts per 15 minutes, pages up to 5 MB and 10 seconds, public
addresses only. The Netlify preview has no server, so `/submit` shows a notice there.

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

## Deploy to the cloud

Every push to `main` runs CI, then the `Deploy` workflow copies the sources to the Hetzner server over SSH and
builds the image there with `docker-compose.cloud.yml`. The existing reverse proxy serves the domain over HTTPS and
forwards it to the port published on the server. The job is skipped while the `RECIPES_DOMAIN` variable is unset.

Set these by hand, in this order (Settings, Secrets and variables, Actions):

1. Pick a free port on the server (`ss -tlnp`).
2. DNS: an `A` record for the domain pointing at the server.
3. The proxy entry: the domain forwards to `127.0.0.1:<port>`, with a certificate and the `Host` header passed through.
   If the proxy runs in Docker, set `RECIPES_PUBLISH_ADDRESS` to the Docker bridge address instead.
4. Secrets: `HETZNER_HOST`, `HETZNER_USERNAME`, `HETZNER_SSH_KEY`, `HETZNER_PORT` (optional, 22),
   `OPENROUTER_API_KEY`, `RECIPES_ADMIN_TOKEN`.
5. Variables: `RECIPES_PUBLISH_PORT`, `OPENROUTER_MODEL`, optionally `RECIPES_PUBLISH_ADDRESS` and
   `DEPLOY_DIRECTORY` (default `recipes`), and last `RECIPES_DOMAIN`, because setting it switches the job on.
6. An off-server copy of the backups.

The workflow writes `.env` from these, with `RECIPES_ALLOWED_HOSTS` derived from the domain. After the start it runs
`scripts/smoke-test.sh https://<domain>`; the same script runs against the cloud compose file in CI.

The database lives in the `recipes_app-data` volume. The `backup` service writes a consistent copy to the
`recipes_app-backups` volume at 03:00 UTC and keeps 14 days. It protects against a damaged database, not a lost
server. Restore:

```sh
cd "$DEPLOY_DIRECTORY"
docker compose --file docker-compose.cloud.yml stop app
docker compose --file docker-compose.cloud.yml run --rm --no-deps --entrypoint sh backup -c '
  cp /backups/recipes.db.<date> /data/recipes.db &&
  rm -f /data/recipes.db-wal /data/recipes.db-shm &&
  chown "$(stat -c %u:%g /data)" /data/recipes.db'
docker compose --file docker-compose.cloud.yml start app
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
