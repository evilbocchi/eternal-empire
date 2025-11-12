## Project Snapshot
- Roblox tycoon using `roblox-ts`, Flamework, and React; entry points `src/server/main.server.ts` (ignites services outside edit mode) and `src/main.client.tsx` (mounts `client/components/App.tsx` into `ReplicatedStorage`).
- Shared gameplay logic lives in `src/shared/**`; prefer currency, data, items, placement, and world helpers over one-off implementations.
- `shared/Context.ts` is the single source for environment flags (`IS_EDIT`, `IS_PUBLIC_SERVER`, `IS_SINGLE_SERVER`, etc.); route persistence, teleports, and live mutations through it.

## Build & Tooling
- `npm run dev` drives `rbxtsc -w --optimizedLoops` alongside `npx rojo serve`; attach Studio with the Rojo plugin for live sync.
- `npm run build:src` regenerates assets then compiles; `npm run build:place` rebuilds the sandbox place (`sandbox/local.rbxl`) via Rojo and `sandbox/pull.js`.
- `npm run plugin` rebuilds the internal tooling plugin in `plugin/`; install it locally for custom dev workflows.
- Asset ids live in `src/shared/asset/AssetMap.ts`; keep them current with `npm run asset-sync` or `npm run asset-watch` when touching `assets/`.

## Server Architecture
- Flamework services live under `src/server/services`; annotate with `@Service()` and rely on `Context.preloadFlameworkServer()` for discovery.
- `server/services/data/DataService.ts` is the canonical persistence layer: resolves empire IDs per environment, migrates currencies with `OnoeNum`, deduplicates items, and schedules saves based on `IS_PUBLIC_SERVER` / `IS_SINGLE_SERVER`.
- Lean on `shared/data/profile` (`EmpireProfileManager`, `EmpireProfileTemplate`, `ThisEmpire`) when reading or mutating profiles instead of manual table edits.

## Networking & Cleanup
- `shared/Packets.ts` centralises `@rbxts/fletchette` RPCs/properties; declare new network traffic there with explicit payloads.
- Always wrap connections, threads, and callbacks in `eat(...)` (`shared/hamster/eat`) so Studio edit mode and stories clean up via Janitor; `eatSnapshot` restores instances after temporary edits.
- Respect `shared/Sandbox.ts`: when sandbox mode is on it moves `Workspace.ItemModels` into `ReplicatedStorage` and many services short-circuit, so gate destructive logic behind `Sandbox.getEnabled()` checks.

## Items & World
- Modules under `src/shared/items/**` export configured `Item` instances; `Items.ts` auto-requires descendants and builds sorted registries, so keep modules side-effect-free beyond item configuration.
- Traits extend `shared/item/traits/ItemTrait.ts` and hook via `item.onLoad` / `item.onClientLoad`; reuse helpers like `Boostable`, `Upgrader`, and `CurrencyBundle`.
- Placement bounds/world metadata live under `shared/placement` and `shared/world/nodes`; use existing validators before spawning parts or accepting placement payloads.

## Client Patterns
- React UI sits in `src/client/components`; group features by domain (quests, marketplace, leaderboard) and prefer hooks in `src/client/hooks` (`useProperty`, `useInterval`, `useDraggable`) over imperative connections.
- Lightweight streaming code belongs in `src/client/parallel`; keep it stateless and cleanup-driven for parallel Luau execution.
- For sounds and particles, call `shared/asset/GameAssets.ts` (`getSound`, `emitEffect`) after ensuring the asset exists in `AssetMap`.

## Testing & Diagnostics
- Server specs live in `src/server/tests/*.spec.ts`; run via `npm run test`.
- CI calls `sandbox/publishAndTest.js`, publishing to the sandbox place then running tests—watch the `X passed, Y failed` log.
- Generated typings (`include/`, `src/services.d.ts`) mirror the Rojo place; rebuild them after hierarchy changes before compiling.