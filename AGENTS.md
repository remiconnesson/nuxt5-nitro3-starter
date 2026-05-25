# AGENTS.md

Guidance for AI coding agents working in this repo. Humans welcome too.

## What this repo is

A minimal starter pinning **Nuxt 5 (nightly)** + **Nitro 3 (beta)** + **h3 v2** to verify
the new stack works end-to-end (SSR page + server route). Both Nuxt 5 and Nitro 3 are
unreleased as of 2026-05-25 — expect breakage on upgrades.

## Version pinning — read this before touching `package.json`

- `nuxt` is aliased to `nuxt-nightly` via the `5x` dist-tag:
  `"nuxt": "npm:nuxt-nightly@5x"`. Do **not** swap it to plain `nuxt` — `nuxt@latest`
  is currently 4.x and does not pull in Nitro 3.
- `nitro@3.x` is forced through npm `overrides` because the Nuxt 5 nightly's
  transitive `@nuxt/nitro-server` may resolve an older Nitro otherwise. Keep the
  override in place until Nitro 3 ships stable.
- After bumping either pin, run `npm install && npx nuxt prepare` and re-verify
  both `/` and `/api/hello` return 200. Nightly drops break things.

**Commit `package-lock.json`.** With nightly dist-tags, an unlocked install
resolves a different version on every CI run. When Vercel restores a build
cache from a prior deploy but installs *newer* nightly versions, the cached
virtual modules (e.g. `.nuxt/fetch.server.mjs`) reference imports the new
Nuxt/Nitro pair doesn't generate, and Rolldown fails to resolve `"nitro"`.
The lockfile is what stops the drift.

To check what actually got installed:

```sh
cat node_modules/nuxt/package.json   | grep -E '"(name|version)"'
cat node_modules/nitro/package.json  | grep -E '"(name|version)"'
cat node_modules/h3/package.json     | grep -E '"(name|version)"'
```

## Nitro 3 / h3 v2 — the API renames that bite

`defineEventHandler` no longer exists. h3 v2 exports:

- `defineHandler` — replaces `defineEventHandler`
- `defineMiddleware` — for `server/middleware/*.ts`
- `defineWebSocketHandler` — for WS routes
- `HTTPError`, `HTTPResponse`, `html` — utilities

Nitro re-exports these from `nitro/runtime`, but in this nightly the Nuxt-generated
Nitro auto-import file (`.nuxt/types/nitro/nitro-imports.d.ts`) is empty — i.e.
**no auto-imports for server handlers**. Until that's wired up, import explicitly:

```ts
// server/api/hello.ts
import { defineHandler } from 'h3'

export default defineHandler((event) => {
  return { ok: true }
})
```

Vue/composables side (`useFetch`, `useState`, etc.) auto-imports work normally —
this issue is server-side only.

## Build / runtime notes

- Builder is **rolldown** (default in Nitro 3), not Rollup. Watch the startup log
  line: `[nitro] ℹ Starting dev watcher (builder: rolldown, preset: nitro-dev, ...)`.
- `compatibilityDate` in `nuxt.config.ts` pins behavior; bump it deliberately, not
  reflexively.
- Node 24 LTS. Older Node may break the rolldown builder.

## When something breaks

1. Check the log line at startup — it prints the exact Nuxt + Nitro + Vite + Vue
   versions actually loaded. The nightly tag in `package.json` is not enough; resolution
   can surprise you.
2. If a server route throws `X is not defined`, it's almost certainly an h3 v2
   rename. Grep `node_modules/nitro/dist/runtime/nitro.mjs` for the new export name
   before guessing.
3. If `nuxt prepare` (auto-run via `postinstall`) regenerates `.nuxt/` with empty
   import declarations, that's expected for now — use explicit imports server-side.

## What NOT to do

- Don't add the legacy `nitropack` package. Nitro 3 ships as `nitro` (different
  package name).
- Don't add `@nuxtjs/*` modules without checking Nuxt 5 compatibility — most
  modules in the ecosystem still target Nuxt 3/4.
- Don't run `npm update` blindly. The pinned overrides are load-bearing.
- Don't commit `.nuxt/`, `.output/`, or `node_modules/` (gitignored, but worth saying).
