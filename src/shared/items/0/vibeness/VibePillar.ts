import Difficulty from "@antivivi/jjt-difficulties";
import Charger from "shared/item/traits/generator/Charger";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Vibe Pillar")
    .setDescription("Uses the power of vibes to charge tesseracts in a 10 stud radius by %mul%.")
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Funds", 10e39).set("Skill", 5500000), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("emoronq2k")

    .trait(Charger)
    .setMul(new CurrencyBundle().set("Dark Matter", 2))
    .setRadius(10)

    .exit();