## Project snapshot
- Roblox tycoon built with `roblox-ts`, Flamework DI, and React UI under `src/client/components`; entry scripts are `src/server/main.server.ts` and `src/client/main.client.tsx`.
- `shared/Context.ts` exposes runtime flags (`IS_SERVER`, `IS_EDIT`, `IS_PUBLIC_SERVER`, `IS_SINGLE_SERVER`); use them to guard persistence, teleporting, and other side-effects.
- `shared/Sandbox.ts` toggles Studio-safe execution. Many services bail early when `Sandbox.getEnabled()` is true, so respect it when adding gameplay code.
- Shared gameplay modules live in `src/shared/**` (`currency`, `data`, `items`, `placement`, `world`); prefer reusing these helpers over reimplementing logic.

## Daily workflow
- Install deps with `npm install`.
- `npm run dev` runs `rbxtsc -w --optimizedLoops` alongside `npx rojo serve`; attach Roblox Studio with the Rojo plugin for live sync.
- Asset ids live in `shared/asset/AssetMap.ts`; keep it fresh with `npm run asset-sync` or watch with `npm run asset-watch` whenever files in `assets/` change.
- `npm run build` performs asset sync then a one-off `rbxtsc`. `npm run lint` runs ESLint over `src`, and `npm run docs` builds TypeDoc.

## Architecture touchpoints
- Server services sit under `src/server/services`, each an `@Service()` resolved through Flamework DI. `main.server.ts` skips heavy imports when Sandbox mode is active and only ignites Flamework when safe.
- `server/services/data/DataService.ts` loads empire profiles via `EmpireProfileManager`, runs migrations (currency conversion, item dedupe), and schedules saves based on environment flags—mirror its patterns when touching persisted data.
- `src/shared/data` defines profile helpers such as `ThisEmpire`, migrations, and currency bundles that both client and server consume.
- Lightweight per-player logic for streaming lives in `src/client/parallel`; keep additions stateless and janitor-friendly.

## Networking & reactive state
- `shared/Packets.ts` centralises all `@rbxts/fletchette` packet/property definitions. Add RPCs and replicated properties here with explicit payload types.
- Services and clients subscribe via `Packets.X.fromClient(...)`, `Packets.Y.fromServer(...)`, and `Packets.Z.observe(...)`; always wrap connections and threads with `eat(...)` (`shared/hamster/eat`) for cleanup.
- Environment-driven behaviour (public/private, edit, single-server) flows from `shared/Context.ts` and workspace attributes. Check these before mutating data, spawning players, or firing broadcasts.

## Items, traits, and placement
- Item modules in `src/shared/items/**` export configured `Item` instances using builder helpers (`setName`, `setPrice`, `setDifficulty`, etc.) and attach behaviour with `item.trait(TraitCtor)`.
- Traits extend `shared/item/traits/ItemTrait.ts`, hooking into `item.onLoad`/`item.onClientLoad`. Keep constructors minimal and leverage shared helpers like `Boostable`, `Upgrader`, and `CurrencyBundle`.
- Placement bounds and world metadata live under `shared/placement` and `shared/world/nodes`; reuse these when validating positions or spawning world parts.

## UI, assets, and simulations
- React UI mounts from `client/components/App.tsx` via `main.client.tsx`; organise new features alongside existing domain folders (sidebar, quests, marketplace, etc.).
- Hooks in `client/hooks` (`useProperty`, `useInterval`, `useDraggable`, etc.) wrap Roblox primitives and packet subscriptions—prefer them over imperative loops.
- Story-driven simulations live in `client/components/*/*.story.tsx` and `client/qa`; they assume Sandbox/studio contexts, so avoid importing server-only services in those files.
- Use `shared/asset/GameAssets.ts` (`getSound`, `emitEffect`) when playing sounds or particles; ensure `AssetMap` contains the asset id before referencing it.

## Testing & diagnostics
- Luau specs reside in `src/server/tests/*.spec.ts` and execute via Roblox Cloud through `npm test`, which calls `test/runTests.js`; set `LUAU_EXECUTION_API_KEY`, `LUAU_EXECUTION_UNIVERSE_ID`, and `LUAU_EXECUTION_PLACE_ID` locally or the task will no-op.
- Cloud runs stream logs line-by-line; scan the task summary for `X passed, Y failed` and raise meaningful errors in those messages.
- Auto-generated typings (`include/`, `services.d.ts`) come from the Rojo place—regenerate them if the Roblox hierarchy changes before compiling.