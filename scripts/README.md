# Scripts

This directory contains utility scripts for the JME project.

## generate-item-ids.js

Generates a TypeScript union type `ItemId` containing all item IDs found in the `src/shared/items` directory structure.

### Usage

```bash
npm run generate-item-ids
```

### What it does

1. Recursively scans all `.ts` files in `src/shared/items/`
2. Identifies files that export Roblox Item objects (looks for `new Item(script.Name)` pattern)
3. Extracts the item ID from each file (based on the filename, which corresponds to `script.Name` in Roblox)
4. Generates a union type with all discovered item IDs
5. Writes the result to `src/shared/types/ItemId.ts`

### Output

The generated file includes:
- Type definition: `export type ItemId = "Item1" | "Item2" | ...`
- Auto-generated header with generation timestamp and item count
- Warning not to manually edit the file

### Filtering

The script automatically excludes:
- `Items.ts` (the main Items class)
- Any files with "Shop" in the name
- Files that don't contain the `new Item(script.Name)` pattern

### Integration

You can import and use the generated type in your TypeScript code:

```typescript
import type { ItemId } from "shared/types/ItemId";

function getItem(id: ItemId) {
    // TypeScript will provide autocomplete and type checking for all valid item IDs
}
```

This ensures type safety when working with item IDs throughout the codebase.