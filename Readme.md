# 📦 Monorepo Guide: Using pnpm for Development

Welcome to the Pong Game monorepo!  
We use [pnpm](https://pnpm.io/) as our package manager for its speed, workspace support, and reliability.  
**Please read and follow these instructions to keep our development workflow smooth for everyone!**

---

## 🚀 Getting Started

### 1. Install pnpm (if you haven’t already)

You only need to do this once:

```bash
npm install -g pnpm
```

From the root of the repo (/transcendence):
``` bash
pnpm install
```

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
│        └── (src, db, etc.)
│
├── /packages   # Each shared package might have its own package.json too!
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
3.	Do not commit node_modules or package-lock.json!
``` bash 
pnpm uses pnpm-lock.yaml at the root.
```
4.	To run scripts:

    Backend: ```pnpm --filter backend dev```

    Frontend: ```pnpm --filter frontend dev```

    All: ```pnpm -r dev```

To add a local (workspace) package, use:
``` bash
pnpm add @repo/shared --filter backend
```

### 🤝 Need Help?
If you’re new to pnpm or monorepos, check out:

- [pnpm Documentation](https://pnpm.io/motivation)
