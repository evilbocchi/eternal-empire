import Difficulty from "@rbxts/ejt";
import Charger from "shared/item/traits/generator/Charger";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Vibe Pillar")
    .setDescription("Uses the power of vibes to charge tesseracts in a 10 stud radius by %mul%.")
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Funds", 100e39).set("Skill", 12000000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .setCreator("emoronq2k")

    .trait(Charger)
    .setMul(new CurrencyBundle().set("Dark Matter", 2))
    .setRadius(10)

    .exit();
