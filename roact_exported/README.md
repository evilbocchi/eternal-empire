These files contain UI elements that have been directly exported from Roblox Studio using a tool that parses into tsx code. However, these code snippets are *not* compatible with the current codebase and require additional modifications to work properly.

Currently, UI elements in this project are created in Roblox Studio and then programmed in controllers (see `src/client/controllers`). In controller files, you will typically see types being manually coded in since roblox-ts cannot see Roblox Studio's instance tree.

Identify where the UI is currently manipulated in the codebase (typically in controllers within `src/client/controllers`), then help port it to a clean, idiomatic React structure.

The process includes:
- Breaking down the monolithic component into smaller, reusable React components.
- Ensuring the resulting code follows React and TypeScript best practices.
- Translating Roblox-specific UI patterns and logic into React paradigms.
- Providing suggestions for state management, props, composition, and code organization.