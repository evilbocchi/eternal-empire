import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("mpstats")
    .setDescription("Display marketplace statistics.")
    .setExecute((o) => {
        const stats = CommandAPI.MarketplaceService.getMarketplaceStats();
        CommandAPI.ChatHook.sendPrivateMessage(o, `Marketplace Status: ${stats.enabled ? "Enabled" : "Disabled"}`, "color:138,255,138");
        // Add more stats as needed
    })
    .setPermissionLevel(2);