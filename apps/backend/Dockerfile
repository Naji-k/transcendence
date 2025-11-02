# Build stage
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc-contract/package.json ./packages/trpc-contract/

# Install ALL dependencies (for building)
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/backend ./apps/backend
COPY packages ./packages

# Build with tsup (bundles @repo/* packages)
WORKDIR /app/apps/backend
RUN pnpm build

# Production stage
FROM node:20-alpine AS production
RUN npm install -g pnpm
WORKDIR /app

COPY apps/backend/package.json ./
COPY pnpm-workspace.yaml ../

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy bundled output
COPY --from=builder /app/apps/backend/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
