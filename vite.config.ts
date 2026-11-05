import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Both fonts are used on every page, and the browser only finds them after the stylesheet; preloading
// them lets the text paint once, in its final font, instead of painting again when the font arrives.
const preloadFonts = (): Plugin => ({
  name: 'preload-fonts',
  transformIndexHtml: {
    order: 'post',
    handler: (_html, context) =>
      Object.keys(context.bundle ?? {})
        .filter((file) => /latin-wght-normal.*\.woff2$/.test(file))
        .map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `/${file}` },
          injectTo: 'head' as const,
        })),
  },
})

const apiTarget = `http://127.0.0.1:${process.env.RECIPES_PORT ?? 4330}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    preloadFonts(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og-image.png'],
      manifest: {
        name: 'Recipe Collection',
        short_name: 'Recipes',
        description: 'Recipes from around the world in English, German, Japanese and Thai.',
        theme_color: '#3f4cb8',
        background_color: '#f7f6f3',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // The server answers these; the service worker must not hand out the app shell for them.
        navigateFallbackDenylist: [/^\/api\//, /^\/media\//, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': apiTarget,
      '/sitemap.xml': apiTarget,
      '/media': apiTarget,
      // Links from before slugs carry the encoded source URL; the server redirects them.
      '^/recipe/https?%3A': apiTarget,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    }
  },
  ssr: {
    noExternal: ['vue-i18n']
  }
})
