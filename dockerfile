FROM --platform=linux/amd64 node:22-alpine AS base

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
COPY .output .

EXPOSE 3000
CMD ["node", "server/index.mjs"]