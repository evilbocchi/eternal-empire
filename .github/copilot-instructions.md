## General Project Context
- This is a Roblox game project built with roblox-ts (TypeScript), using frameworks such as React and Flamework. The codebase uses a modular structure, with items, NPCs, and upgrades organized by type and category.

## Coding Style
- When creating new items, NPCs, or upgrades, follow the structure and naming conventions of existing files in the relevant folders.
- Some properties may be different due to roblox-ts syntax:
    - Use `array.size()` instead of `array.length` for arrays
    - `array.sort()` takes a boolean comparison (a < b) function instead of a number comparison (a - b) function
    - Use `map.get(key)` instead of `map[key]` for maps
    - Do not use `null`, use `undefined` instead
    - Do not use `any`, use specific types or `unknown` if necessary
    - Global objects and their methods like `Array.from`, `Object.keys`, etc. may not be available. Use barebones alternatives.
    - Use `print(...)` for debugging output instead of `console.log(...)`
    - Use `math` instead of `Math` for math functions
    - Refer to the codebase to see how other common tasks are accomplished.
- Use descriptive names for variables and functions to improve code readability.
- Prefer declaring types in the global namespace if reused across multiple files.
- Many niche libraries are used in the codebase. Refer to existing code for examples of how to use them. 

## Documentation
- Add or update JSDoc comments for new classes, methods, or exported objects if they are not self-explanatory.
- Keep descriptions clear and concise, focusing on gameplay or code purpose.