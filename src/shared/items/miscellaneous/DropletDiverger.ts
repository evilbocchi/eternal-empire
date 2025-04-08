import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Droplet Diverger")
    .setDescription("Used to separate stuff. Not sure why you would need this.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Bitcoin", 10))
    .setRequiredItemAmount(ExcavationStone, 20)
    .setRequiredItemAmount(WhiteGem, 2)
    .addPlaceableArea("BarrenIslands")
    .setCreator("Alexanderloney")

    .trait(Conveyor)
    .setSpeed(4)

    .exit();