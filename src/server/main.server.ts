import { Dependency, Flamework } from "@flamework/core";
import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { PlaytimeService } from "server/services/serverdata/PlaytimeService";

Players.CharacterAutoLoads = false;
Workspace.WaitForChild("ClientSidedObjects").Parent = ReplicatedStorage;
Flamework.addPaths("src/server/services");
Flamework.ignite();

const dataService = Dependency<DataService>();
const playtimeService = Dependency<PlaytimeService>();
const currencyService = Dependency<CurrencyService>();
const itemsService = Dependency<ItemsService>();

print("Playtime: " + playtimeService.getPlaytime());
print("Funds: " + tostring(currencyService.getCost("Funds")));
print("Items: " + itemsService.getPlacedItems().size());
print(dataService.empireProfile?.Data);
Players.CharacterAutoLoads = true;
for (const player of Players.GetPlayers()) {
    player.LoadCharacter();
}
