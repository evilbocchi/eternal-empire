## Project snapshot
- Roblox tycoon built with `roblox-ts`, Flamework DI, and React (`src/server/services`, `src/client/controllers`, `src/client/ui`).
- `shared/Context.ts` boots Flamework and exports runtime flags like `IS_SERVER`, `IS_EDIT`, `IS_PUBLIC_SERVER`; gate behaviour with them.
- Local sandbox flows live in `shared/Sandbox.ts`; many systems bail early there to keep Studio/CI safe.

## Daily workflow
- Install deps with `npm install`; `npm run dev` runs `rbxtsc -w --writeTransformedFiles` plus `rojo serve` for live sync.
- `npm run build` runs `npm run asset-sync` then a one-off `rbxtsc`; rerun `npm run asset-sync` whenever files in `assets/` move.
- Tests (`npm test`) call `src/server/tests/runTests.ts` via Roblox Cloud; set `LUAU_EXECUTION_API_KEY`, `LUAU_EXECUTION_UNIVERSE_ID`, `LUAU_EXECUTION_PLACE_ID` locally or runs will no-op.
- Lint with `npm run lint`; `npm run docs` builds TypeDoc. CI mirrors lint → build → test.

## Architecture touchpoints
- Server logic lives in Flamework `@Service()` classes under `src/server/services`; constructor injection wires dependencies, and `OnStart` often guards with `Sandbox.getEnabled()`.
- Client behaviour combines Flamework controllers and React roots. `client/controllers/core/AppController.tsx` mounts `client/ui/components/App`, while other controllers manage world state, NPCs, and permissions.
- Shared gameplay code sits in `src/shared` (currency, resets, quests, placement). `shared/Packets.ts` centralises network state definitions; `world/` contains placement bounds and nodes.
- Parallel scripts under `src/client/parallel` run lightweight actees; keep them stateless and streaming-friendly.

## Networking & data flow
- Add RPC/state channels in `shared/Packets.ts` using `@rbxts/fletchette` (`packet()` for calls, `property()` for replicated data) and keep types inline for serialization.
- Services/controllers subscribe through `Packets.x.fromClient/fromServer()` and `Packets.y.observe(...)`; wrap connections in `eat(...)` to ensure cleanup.
- `server/services/data/DataService.ts` loads and saves empire profiles via `@antivivi/profileservice`, running migrations for stored fields—follow its patterns when touching schemas.
- Environment feature switches (single-server, public/private, sandbox) flow from `shared/Context.ts` and `shared/Sandbox.ts`; check those before enabling side effects.

## Item & trait system
- Items live in `src/shared/items`; each module returns a configured `Item` with chained helpers (`setName`, `setPrice`, `setDifficulty`, etc.) and registered traits.
- Traits extend `shared/item/traits/ItemTrait.ts` and attach behaviour via `item.trait(TraitCtor)`, `item.onLoad`, and `item.onClientLoad`. Keep constructors light and use shared helpers like `Boostable`, `Upgrader`, and `Streaming` from `@antivivi/vrldk`.
- Stick to roblox-ts conventions: use `array.size()`, boolean comparators in `array.sort`, `map.get(key)`, `undefined` instead of `null`, and avoid `any` (prefer concrete types or `unknown`).
- Use `print` for logging, `math` for math helpers, and prefer declaring shared interfaces in `declare global` blocks.

## UI, assets, and effects
- Asset ids are generated into `shared/asset/AssetMap.ts` via `npm run asset-sync`; look up sounds/effects with `shared/asset/GameAssets.ts` (`getSound`, `emitEffect`).
- Client controllers such as `AreaController` react to packet updates, fire assets, and move models while respecting sandbox checks.
- React UI composes under `client/ui/components`; hooks/managers (e.g., `MusicManager`, `hooks/`) read packets and world nodes for state.
- Always register disposable work with `eat(...)` (from `shared/hamster/eat`) when you spawn instances, connections, or intervals.

## Testing & utilities
- Server-side specs live in `src/server/tests/*.spec.ts` and bootstrap via `TestEZ`; keep them deterministic so Roblox Cloud runs stay green.
- Auto-generated typings (`services.d.ts`, `include/`) come from your Rojo place; refresh them when the Roblox place hierarchy changes.
- Discord/webhook integrations read env vars like `LEADERBOARD_WEBHOOK` and `PROGRESSION_WEBHOOK`; see `docs/leaderboard-webhooks.md`.
- Documentation sits in `docs/`; update TypeDoc output in `docsout/` when APIs change.