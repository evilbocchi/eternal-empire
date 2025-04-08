import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import WhiteGem from "shared/items/excavation/WhiteGem";
import { GameUtils } from "shared/item/ItemUtils";

export = new Item(script.Name)
    .setName("Crystal Drill")
    .setDescription("Mines some good Power with %val% droplets every second. Also has a small chance of dropping Crystal per droplet produced...")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Funds", 56.5e30))
    .setRequiredItemAmount(WhiteGem, 70)
    .setRequiredItemAmount(Crystal, 25)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .trait(Dropper)
    .setDroplet(Droplet.CrystalDroplet)
    .setDropRate(1)
    .onDropletProduced(() => {
        const questMetadata = GameUtils.empireData.questMetadata;
        let prevCount = questMetadata.get("CrystalDrillCount") as number ?? 0;
        prevCount += 1;
        if (math.random(1, 60 * math.pow(prevCount, 2)) === 1) { // XD
            GameUtils.giveQuestItem(Crystal.id, 1);
            questMetadata.set("CrystalDrillCount", prevCount);
        }
    })

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
