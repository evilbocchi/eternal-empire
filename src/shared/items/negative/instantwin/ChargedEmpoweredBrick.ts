import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";

export = new Item(script.Name)
    .setName("Charged Empowered Brick")
    .setDescription("A imbued power brick that has been charged with Instant Win energy. It's so powerful it actually applies %mul% to nearby droplets.")
    .setDifficulty(Difficulty.InstantWin)
    .placeableEverywhere()
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.25))

    .exit();