FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS production-dependencies
RUN pnpm install --frozen-lockfile --prod

FROM node:22-slim
ENV NODE_ENV=production \
    RECIPES_HOST=0.0.0.0 \
    RECIPES_PORT=4330 \
    RECIPES_DB_PATH=/data/recipes.db \
    RECIPES_STATIC_DIR=/app/dist
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
COPY scripts ./scripts
COPY --from=build /app/dist ./dist
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 4330
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4330/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "server/index.ts"]
