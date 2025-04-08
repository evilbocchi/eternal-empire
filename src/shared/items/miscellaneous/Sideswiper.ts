import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import OmniUpgrader from "shared/item/traits/special/OmniUpgrader";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Sideswiper")
    .setDescription("A compact little gadget for some moderate gains! The blue laser gives a Bitcoin boost while the yellow laser gives a Power boost, adding up to %add%.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Bitcoin", 200))
    .setRequiredItemAmount(ExcavationStone, 30)
    .setRequiredItemAmount(WhiteGem, 25)
    .addPlaceableArea("BarrenIslands")
    .setCreator("goog_als")

    .trait(OmniUpgrader)
    .setAdds(new Map([
        ["BitcoinLaser", new CurrencyBundle().set("Bitcoin", 0.75)],
        ["PowerLaser", new CurrencyBundle().set("Power", 4000)],
    ]))
    .setAdd(new CurrencyBundle().set("Power", 4000).set("Bitcoin", 0.75))

    .exit();