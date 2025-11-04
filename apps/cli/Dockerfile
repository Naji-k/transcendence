# Build stage
FROM node:22-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/cli/package.json ./apps/cli/
COPY packages/tsconfig-base/package.json ./packages/tsconfig-base/
COPY packages/db/package.json ./packages/db/
COPY packages/trpc-contract/package.json ./packages/trpc-contract/

RUN pnpm install --frozen-lockfile

COPY apps/cli ./apps/cli
COPY packages ./packages

WORKDIR /app/apps/cli
RUN pnpm build

# Production stage
FROM node:22-alpine AS production
RUN npm install -g pnpm
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/cli/package.json ./apps/cli/
COPY packages/tsconfig-base/package.json ./packages/tsconfig-base/
COPY packages/trpc-contract/package.json ./packages/trpc-contract/
RUN pnpm install --frozen-lockfile --prod

# Copy dist
COPY --from=builder /app/apps/cli/dist ./apps/cli/dist

ENV BACKEND_API=backend
WORKDIR /app/apps/cli
RUN npm install -g .

CMD [ "/bin/sh" ]
