import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Stale Wood")
    .setDescription("Apparently, wood can go stale too, and these logs have been through tough times to be in such a rotted state.")
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();