---
title: Introduction
---

# Introduction

**jme** is a Roblox game and open-source project where players build and manage their own money-making empires in the world of Obbysia. The game blends tycoon mechanics, creative building, and RPG-style progression, offering a unique experience that rewards both strategic planning and exploration.

## What is jme?

jme challenges players to:
- **Build and expand** their empires using a wide variety of items, tools, and upgraders.
- **Interact with NPCs** who provide quests, lore, and unique upgrades.
- **Progress through difficulties** inspired by the EJT Difficulty Chart, unlocking new areas and mechanics as they advance.
- **Compete on leaderboards** for achievements in time played, funds, power, skill, and donations.

The game is under active development, with frequent updates, new content, and ongoing balancing. Our goal is to maintain a stable, fun experience while continually expanding the world and its systems.

## Project Structure

jme is built with TypeScript and designed for modularity and extensibility:
- **Items, NPCs, and upgrades** are organized by type and category in the `src/shared/items`, `src/shared/npcs`, and `src/shared/upgrades` folders.
- **Each file** typically exports a single object or class instance, using method chaining for configuration (e.g., `.setName()`, `.setDescription()`, `.setDifficulty()`).
- **Custom types and classes** such as `Item`, `NPC`, `CurrencyBundle`, and `Difficulty` provide a robust foundation for gameplay systems.
- **Client and server code** are separated, with controllers managing UI, gameplay, and world logic.

## Development

### Workflow

- **Open Source:** Contributions are welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
- **Stable Main Branch:** We strive to keep the main branch playable and stable. Features are developed in branches and merged after review.
- **Automated Build:** The project uses Node.js tooling and Rojo for Roblox integration. See [README.md](../README.md) for setup instructions.
- **Documentation:** Major systems and features are documented in the `docs/` folder. TypeDoc is used for API documentation.

### Community & Conduct

- **Inclusive Community:** We follow a [Code of Conduct](../CODE_OF_CONDUCT.md) to ensure a welcoming environment.
- **Responsible Disclosure:** Security issues should be reported privately (see [SECURITY.md](../SECURITY.md)).
- **Attribution:** We credit all contributors and asset creators. See [assets/sounds/attribution.md](../assets/sounds/attribution.md) for sound credits.

### Contributing

- **Follow the existing code style** and use method chaining for configuration.
- **Document new features** and update relevant docs.
- **Test your changes** before submitting a pull request.
- **Join the discussion** on [Discord](https://discord.gg/haPBmCSvXt) or [GitHub Issues](https://github.com/evilbocchi/jme/issues).

For a step-by-step guide to contributing, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## License

jme is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License. You are free to use, share, and modify the code for personal or non-commercial purposes. Commercial use is not permitted. See [LICENSE](../LICENSE) for details.