import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ThisEmpire from "shared/data/ThisEmpire";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import { Server } from "shared/api/APIExpose";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Dropper from "shared/item/traits/dropper/Dropper";
import Crystal from "shared/items/excavation/Crystal";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Crystal Drill")
    .setDescription(
        "Mines some good Power with %val% droplets every second. Also has a small chance of dropping Crystal per droplet produced...",
    )
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new CurrencyBundle().set("Funds", 56.5e30), 1)
    .setRequiredItemAmount(WhiteGem, 70)
    .setRequiredItemAmount(Crystal, 25)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Dropper)
    .setDroplet(Droplet.CrystalDroplet)
    .setDropRate(1)
    .onDropletProduced(() => {
        const questMetadata = ThisEmpire.data.questMetadata;
        let prevCount = (questMetadata.get("CrystalDrillCount") as number) ?? 0;
        prevCount += 1;
        if (math.random(1, 60 * math.pow(prevCount, 2)) === 1) {
            // XD
            Server.Quest.giveQuestItem(Crystal.id, 1);
            questMetadata.set("CrystalDrillCount", prevCount);
        }
    })

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
