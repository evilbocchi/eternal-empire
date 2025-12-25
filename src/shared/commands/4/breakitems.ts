import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("breakallitems")
    .setDescription("Force every placed item into a broken state, triggering the repair mini-game.")
    .setPermissionLevel(4)
    .setExecute((sender) => {
        const placementIds = new Array<string>();
        for (const [placementId] of CommandAPI.empireData.items.worldPlaced) {
            placementIds.push(placementId);
        }
        CommandAPI.Item.beginBreakdown(placementIds);
        const count = placementIds.size();

        CommandAPI.ChatHook.sendPrivateMessage(
            sender,
            `Forced ${count} item${count === 1 ? "" : "s"} to break.`,
            "color:255,200,70",
        );
    });
