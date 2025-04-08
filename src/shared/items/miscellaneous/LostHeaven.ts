import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/Generator";
import Item from "shared/item/Item";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Lost Heaven")
    .setDescription("Everything around you unbelievably serene, an elysian realm the only thing you imagine in this world. Produces %gain%.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Skill", 40).set("Dark Matter", 200000))
    .setRequiredItemAmount(WhiteGem, 100)
    .setCreator("CoPKaDT")
    .addPlaceableArea("SlamoVillage")
    .persists()

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 4510000))

    .exit();