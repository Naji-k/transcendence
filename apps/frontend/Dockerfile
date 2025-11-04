# Build stage
FROM node:22-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/tsconfig-base/package.json ./packages/tsconfig-base/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc-contract/package.json ./packages/trpc-contract/

# Install ALL dependencies (for building)
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/frontend ./apps/frontend
COPY packages ./packages

# Build with svelte-node (vite)
WORKDIR /app/apps/frontend
RUN pnpm build

FROM node:22-alpine AS production
RUN npm install -g pnpm
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/tsconfig-base/package.json ./packages/tsconfig-base/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc-contract/package.json ./packages/trpc-contract/

# Install ONLY production dependencies
RUN pnpm install --frozen-lockfile 

# Copy bundled output
COPY --from=builder /app/apps/frontend/build ./apps/frontend/build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/frontend/build"]
