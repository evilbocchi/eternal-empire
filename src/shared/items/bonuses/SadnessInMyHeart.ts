import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Sadness In My Heart")
    .setDescription("I'm sorry...")
    .setDifficulty(Difficulty.Bonuses)
    .addPlaceableArea("BarrenIslands", "SlamoVillage");
