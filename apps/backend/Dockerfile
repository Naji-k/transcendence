# Build stage
FROM node:22-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/tsconfig-base/package.json ./packages/tsconfig-base/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc-contract/package.json ./packages/trpc-contract/

# Install ALL dependencies (for building)
RUN pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend
COPY packages ./packages

# Build with tsup (bundles @repo/* packages)
WORKDIR /app/apps/backend
RUN pnpm build
RUN pnpm --filter backend db:generate

# Production stage
FROM node:22-alpine AS production
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/tsconfig-base/package.json ./packages/tsconfig-base/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc-contract/package.json ./packages/trpc-contract/

RUN pnpm install --frozen-lockfile --prod

# Copy dist from builder stage
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/database.sqlite ./database.sqlite


ENV NODE_ENV=production

EXPOSE 4000


CMD ["node", "apps/backend/dist/index.js"]
