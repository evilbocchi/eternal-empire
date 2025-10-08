import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

export = new Item(script.Name)
    .setName("Class Negative Shop")
    .setDescription("Purchase all of your items here! Well, at least all items below Instant Win difficulty.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .addPlaceableArea("BarrenIslands")
    .persists()

    .trait(Shop)
    .exit();
