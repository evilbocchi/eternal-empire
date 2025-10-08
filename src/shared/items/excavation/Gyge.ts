import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import StargazedMetal from "shared/items/excavation/StargazedMetal";

export = new Item(script.Name)
    .setName("Gyge")
    .setDescription(
        "A deep magenta mineral that absorbs ambient sound. Often etched into silencers for volatile droplet rigs.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(StargazedMetal, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
