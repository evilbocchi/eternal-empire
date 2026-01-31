import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("er")
    .setDescription("Estimate the current revenue based on the current world setup.")
    .setExecute((_o) => {
        const oldWeatherBoostEnabled = Server.Revenue.weatherBoostEnabled;
        Server.Revenue.weatherBoostEnabled = false;
        const cleanup = Server.ProgressEstimation.populateDropletModels();

        const itemsToUse = new Map<string, number>();
        const worldPlaced = Server.empireData.items.worldPlaced;
        for (const [, placedItem] of worldPlaced) {
            const itemsCount = itemsToUse.get(placedItem.item) ?? 0;
            itemsToUse.set(placedItem.item, itemsCount + 1);
        }
        const revenue = Server.ProgressEstimation.calculateRevenue(Server.Currency.balance, itemsToUse);
        Server.ChatHook.sendServerMessage(revenue.toString());

        Server.Revenue.weatherBoostEnabled = oldWeatherBoostEnabled;
        cleanup();
    })
    .setPermissionLevel(4);
