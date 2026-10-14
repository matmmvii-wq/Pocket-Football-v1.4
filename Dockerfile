# Build Pocket Football from source
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Verify TypeScript and build production assets.
# Gameplay tests remain available through npm test,
# but do not block production image creation.
RUN npm run check && npm run build

# Lightweight production image
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/server.mjs"]