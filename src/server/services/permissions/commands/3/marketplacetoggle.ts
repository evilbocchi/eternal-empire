import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("mptoggle")
    .setDescription("Enable/disable the marketplace.")
    .setExecute((o) => {
        const stats = CommandAPI.MarketplaceService.getMarketplaceStats();
        const newEnabled = !stats.enabled;
        CommandAPI.MarketplaceService.setMarketplaceEnabled(newEnabled);
        CommandAPI.ChatHook.sendPrivateMessage(o, `Marketplace has been ${newEnabled ? "enabled" : "disabled"}`, 
            newEnabled ? "color:138,255,138" : "color:255,43,43");
    })
    .setPermissionLevel(3);