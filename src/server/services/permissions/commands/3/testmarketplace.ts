import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("tmptest")
    .setDescription("Test the marketplace functionality.")
    .setExecute((o) => {
        CommandAPI.SimpleMarketplaceService.testMarketplace();
        CommandAPI.ChatHook.sendPrivateMessage(o, "Marketplace test completed - check console output", "color:138,255,138");
    })
    .setPermissionLevel(3);