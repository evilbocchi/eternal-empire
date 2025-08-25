## General Project Context
- This is a Roblox game project built with roblox-ts (TypeScript). The codebase uses a modular structure, with items, NPCs, and upgrades organized by type and category.
- Most files export a single object or class instance using `export = ...`
- Common patterns include method chaining for configuration (e.g., .setName().setDescription().setDifficulty()...).
- The workspace uses custom types and classes such as `Item`, `NPC`, `CurrencyBundle`, `Difficulty`, and various other sub-classes.

## Coding Style
- Prefer concise, readable code with clear method chaining.
- Use named imports for shared types and classes (e.g., `import NPC from "shared/NPC"`).
- When creating new items, NPCs, or upgrades, follow the structure and naming conventions of existing files in the relevant folders.
- Use `.setName`, `.setDescription`, `.setDifficulty`, and similar methods for configuration.
- For NPCs, use `.createDefaultMonologue` and `.monologue` for dialogue.
- For items, use `.setPrice`, `.placeableEverywhere`, `.persists`, and other relevant methods as needed.
- For *important* files, include a file overview summarizing its purpose. If there are attributes e.g. `//!native` at the top of the file, place the overview below it and above imports. View existing files (e.g. `server/services/data/DataService.ts`) for reference.

## File Organization
- Place new items in the appropriate subfolder under shared/items based on their type and category.
- Place new NPCs in shared/npcs with a descriptive filename.
- Each file should generally define and export a single item, NPC, or upgrade.

## Documentation
- Add or update JSDoc comments for new classes, methods, or exported objects if they are not self-explanatory.
- Keep descriptions clear and concise, focusing on gameplay or code purpose.