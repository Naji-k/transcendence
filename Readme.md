# 📦 Monorepo Guide: Using pnpm for Development

Welcome to the Pong Game monorepo!  
We use [pnpm](https://pnpm.io/) as our package manager for its speed, workspace support, and reliability.  
**Please read and follow these instructions to keep our development workflow smooth for everyone!**

---

## 🚀 Getting Started

### Install pnpm (if you haven’t already)

You only need to do this once:

```bash
npm install -g pnpm #at codam we don't have the rights to install pnpm
```

   ### 🚨 At Codam 

```bash
docker compose up -d
docker compose exec pong bash

pnpm install
```


After pulling changes from the root directory run :
``` bash
pnpm install
```
### To run Apps

- Backend: `pnpm --filter backend dev` || `pnpm dev:backend`

- Frontend: `pnpm --filter frontend dev` || `pnpm dev:frontend`

- All: `pnpm dev`
- Eslint: `pnpm lint:backend` || `pnpm lint:frontend` || `pnpm lint`
- Prettier formatter: `pnpm format:backend` || `pnpm format:frontend` || `pnpm format`

### Project Structure
``` bash
/Trancendence
│
├── /apps
│   ├── /frontend
│   │    ├── package.json   
│   │    └── (src)
│   └── /backend
│        ├── package.json   
│        └── (src)
│
├── /packages #shared packages between frontend, backend: (db, auth, trpc, types)
│   ├── /db
│   │  ├── package.json   
│   │  └── (src)
│   └── /trpc
│        ├── package.json   
│        └── (src)
├── /infra
├── Caddyfile
├── docker-compose.yml
└── package.json            
```
### 🛠️ Important Rules When Using pnpm:
1.	Never use npm install or yarn install in any sub-folder.
Always use pnpm install from the root directory.

2.	Add new packages with pnpm, not npm/yarn!
    Example:
    To add lodash to backend only:
    ``` bash
    pnpm add lodash --filter backend
    ```
    To add a dev dependency to frontend only:
    ``` bash
    pnpm add -D esbuild --filter frontend
    ```


4. How to use shared(packges) <package-name>: (ex: will use `trpc` as shared package)

    create a sub-dir for the packge with it's name, 
    ``` bash
    mkdir -p packages/trpc
    cd packages/trpc
    npm init --scope=repo (to be shared by other apps)
    ```
    make sure you will have the following in `./packages/trpc/package.json` ->   `"name": "@repo/trpc"`.
   
    **from root directory**
    ``` bash
    pnpm add <package-name> --filter @repo/trpc
    #ex:
    pnpm add zod --filter @repo/trpc #adding package zod to ./package/trpc

    ```

6. To use a share package with frontend or backend, you need to add it by the following:
    ``` bash
    pnpm add @repo/trpc --workspace --filter backend  # installs the @repo/trpc package as a dependency specifically for the backend project
    ```

### 🤝 Need Help?
If you’re new to pnpm or monorepos, check out:

- [pnpm Documentation](https://pnpm.io/motivation)
