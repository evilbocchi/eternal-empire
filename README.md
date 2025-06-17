<p align="center">
  <img width="350" src="assets/Logo.png">
</p>

# JJT Money Empire

[![Build](https://github.com/Unreal-Works/jme/actions/workflows/build-and-release.yml/badge.svg?branch=master&event=push)](https://github.com/Unreal-Works/jme/actions/workflows/build-and-release.yml)
[![GitHub](https://img.shields.io/github/release/Unreal-Works/jme.svg)](https://github.com/Unreal-Works/jme/releases/latest)
[![CodeFactor](https://www.codefactor.io/repository/github/Unreal-Works/jme/badge)](https://www.codefactor.io/repository/github/Unreal-Works/jme)
[![Discord](https://discordapp.com/api/guilds/1217488177862938654/widget.png?style=shield)](https://discord.gg/haPBmCSvXt)

[JJT Money Empire](https://www.roblox.com/games/16438564807/JJT-Money-Empire) is a Roblox game where players can build their own money-making empire.

## Setup

To set up the development environment for JJT Money Empire, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/Unreal-Works/jme.git
    cd jme
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Install Rojo:
    - Rojo is bundled with this project, accessible with `npx rojo`. For operating systems that do not support the existing pre-built binaries, follow the [crates.io installation](https://rojo.space/docs/v7/getting-started/installation/) of Rojo.
    - However, you will need to install the Roblox Studio plugin for Rojo yourself. To do so, either try running `npx rojo plugin install` or follow the [official documentation](https://rojo.space/docs/v7/getting-started/installation/).

4. Run the environment:
    ```sh
    npm run dev
    ```

5. Connect to the Rojo server with the Roblox Studio plugin. Changes made to files in your code editor should now sync with Roblox Studio.

## Contributing

We welcome contributions to improve JJT Money Empire. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your fork.
5. Open a pull request to the main repository.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.

**You are free to:**
- Use, share, and modify the code for personal or non-commercial purposes.
- Create and distribute mods or derivative works, as long as they are not for commercial use.

**You may not:**
- Use any part of this project or its derivatives for commercial purposes.

See the [LICENSE](LICENSE) file for full details.