# Build and serve the ContentLineup marketing site.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY build.mjs serve.mjs ./
COPY src ./src
COPY public ./public
RUN node build.mjs

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 LOG=off
COPY --from=build /app/dist ./dist
COPY --from=build /app/serve.mjs ./serve.mjs
COPY --from=build /app/package.json ./package.json
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
USER node
CMD ["node", "serve.mjs"]
