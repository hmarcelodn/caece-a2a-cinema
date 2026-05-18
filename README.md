# CAECE SO2

Minimal Turborepo scaffold using Yarn Classic workspaces.

## Requirements

- Node.js 20 (see `.nvmrc`)
- Yarn Classic 1.x

## Getting Started

Install dependencies:

```sh
yarn
```

Run workspace tasks through Turbo:

```sh
yarn dev
yarn build
yarn lint
yarn test
```

Run apps by layer (prefer this over `yarn dev`, which starts every workspace and can cause port conflicts):

| Order | Command | What runs |
| ----- | ------- | --------- |
| 1 | `yarn dev:agents` | A2A agents only: weather **3002**, scout **3005**, movies-research **3006**, profile **3007** |
| 2 | `python server.py` in [caece-cinema-manager](../caece-cinema-manager) | Cinema manager **3004** (checks agents at startup) |
| 3 | `yarn turbo run dev --filter=lumus-ui` | Lumus UI **3000** (BFF → manager `/recommend`) |

**Port conflict:** `weather-agent` uses port **3002**. If Next.js cannot bind to 3000, it may fall back to **3002** and collide with the weather agent. Use `yarn dev:agents` without the UI first, or free port 3000 before starting `lumus-ui`.

**Debug logging (handoffs / sub-agent calls):**

- Manager: `CINEMA_DEBUG=1 python server.py` — prints BeeAI trajectory and a summary of each tool step (handoffs included).
- Sub-agents: each A2A server logs HTTP requests and incoming task text to the console when invoked.

Legacy scripts (if present elsewhere in the repo):

1. **Downstream** — `yarn dev:downstream`
2. **Upstream** — `yarn dev:upstream` (commander on 3004)
3. **API** — `yarn dev:api` — set `COMMANDER_AGENT_URL` if not `http://localhost:3004`.

Clean generated files:

```sh
yarn clean
```

## Structure

```text
apps/
packages/
```

Use `apps/` for runnable applications and `packages/` for shared libraries or configuration.

## Adding An App

Create a new folder under `apps/` with its own `package.json`:

```json
{
  "name": "@caece-so2/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "echo \"add dev command\"",
    "build": "echo \"add build command\"",
    "lint": "echo \"add lint command\"",
    "test": "echo \"add test command\""
  }
}
```

## Adding A Package

Create a new folder under `packages/` with its own `package.json`:

```json
{
  "name": "@caece-so2/types",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "scripts": {
    "build": "echo \"add build command\"",
    "lint": "echo \"add lint command\"",
    "test": "echo \"add test command\""
  }
}
```

Yarn will automatically detect packages matching the root workspace globs: `apps/*` and `packages/*`.
