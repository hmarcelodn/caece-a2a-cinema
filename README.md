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

Run apps by layer (instead of `yarn dev`, which starts every workspace with a `dev` script):

1. **Downstream** — engineer + climate A2A agents (ports 3003 and 3002): `yarn dev:downstream`
2. **Upstream** — commander agent (port 3004). Start after downstream is up; it checks those agents at startup: `yarn dev:upstream`
3. **API** — Ignition server (port 3000), HTTP hacia el commander A2A: `yarn dev:api`  
   Set `COMMANDER_AGENT_URL` if the commander is not at `http://localhost:3004`.

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
