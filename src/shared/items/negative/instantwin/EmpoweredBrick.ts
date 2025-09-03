import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Empowered Brick")
    .setDescription(
        "A brick that has been imbued with power, ready to be placed in the world. Does absolutely nothing.",
    )
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Power", 5000000))
    .setRequiredItemAmount(WhiteGem, 6)
    .setRequiredItemAmount(Crystal, 2)
    .placeableEverywhere()
    .persists();
