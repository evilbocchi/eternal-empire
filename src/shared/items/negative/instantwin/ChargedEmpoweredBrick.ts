import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Charged Empowered Brick")
    .setDescription(
        "A imbued power brick that has been charged with Instant Win energy. It's so powerful it actually applies %add% to nearby droplets.",
    )
    .setDifficulty(Difficulty.InstantWin)
    .placeableEverywhere()
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 1000))

    .exit();
