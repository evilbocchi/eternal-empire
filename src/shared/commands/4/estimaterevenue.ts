import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("er")
    .setDescription("Estimate the current revenue based on the current world setup.")
    .setExecute((_o) => {
        const oldWeatherBoostEnabled = CommandAPI.Revenue.weatherBoostEnabled;
        CommandAPI.Revenue.weatherBoostEnabled = false;
        const cleanup = CommandAPI.ProgressEstimation.populateDropletModels();

        const itemsToUse = new Map<string, number>();
        const worldPlaced = CommandAPI.empireData.items.worldPlaced;
        for (const [, placedItem] of worldPlaced) {
            const itemsCount = itemsToUse.get(placedItem.item) ?? 0;
            itemsToUse.set(placedItem.item, itemsCount + 1);
        }
        const revenue = CommandAPI.ProgressEstimation.calculateRevenue(CommandAPI.Currency.balance, itemsToUse);
        CommandAPI.ChatHook.sendServerMessage(revenue.toString());

        CommandAPI.Revenue.weatherBoostEnabled = oldWeatherBoostEnabled;
        cleanup();
    })
    .setPermissionLevel(4);
