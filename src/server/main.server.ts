import { Dependency, Flamework } from "@flamework/core";
import { Players, RunService } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { PlaytimeService } from "server/services/serverdata/PlaytimeService";

Players.CharacterAutoLoads = false;
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

if (RunService.IsStudio()) {
    // cheat stuff in
    //currencyService.setCost("Funds", new InfiniteMath(5050000000))
    //currencyService.setCost("Power", new InfiniteMath(2000))
    //ItemsService.setItemAmount("HandCrankDropper", 1)
}
Players.CharacterAutoLoads = true;
for (const player of Players.GetPlayers()) {
    player.LoadCharacter();
}