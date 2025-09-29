import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("breakallitems")
    .setDescription("Force every placed item into a broken state, triggering the repair mini-game.")
    .setPermissionLevel(4)
    .setExecute((sender) => {
        const brokenCount = CommandAPI.ItemBreakdown.forceBreakAllItems();
        CommandAPI.ChatHook.sendPrivateMessage(
            sender,
            `Forced ${brokenCount} item${brokenCount === 1 ? "" : "s"} to break.`,
            "color:255,200,70",
        );
    });
