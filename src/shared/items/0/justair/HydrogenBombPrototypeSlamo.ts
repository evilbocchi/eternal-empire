import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Clicker from "shared/item/traits/action/Clicker";
import SlamoClicker from "shared/items/0/millisecondless/SlamoClicker";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Hydrogen Bomb Prototype Slamo")
    .setDescription(
        "Slamo was sick of clicking and decided, 'I'm just going to make a nuclear fission hydrogen reactor inside myself so it can click for me!' And miraculously, it worked. Clicks at %cps%.",
    )
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new CurrencyBundle().set("Funds", 20e30).set("Purifier Clicks", 1000000), 1)
    .setRequiredItemAmount(SlamoClicker, 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Clicker)
    .setClickRate(5)
    .setClickValue(15000)

    .exit();
