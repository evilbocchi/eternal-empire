import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("stwh")
    .setDescription("<webhook_url> : Set the trade recovery webhook URL.")
    .setExecute((o, webhookUrl) => {
        CommandAPI.MarketplaceService.setTradeTokenWebhook(webhookUrl);
        CommandAPI.ChatHook.sendPrivateMessage(o, "Trade webhook URL has been set", "color:138,255,138");
    })
    .setPermissionLevel(4);