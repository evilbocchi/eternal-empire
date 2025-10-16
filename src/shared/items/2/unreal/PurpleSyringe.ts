import Difficulty from "@rbxts/ejt";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";

export = new Item(script.Name)
    .setName("Purple Syringe")
    .setDescription(
        "What is this...? It seems to ooze a strange substance that contains %val%. Try placing it down to find out.",
    )
    .setDifficulty(Difficulty.Unreal)
    .addPlaceableArea("MinerHaven")
    .setLevelReq(0)

    .trait(Dropper)
    .setDroplet(Droplet.UnrealDroplet)
    .setDropRate(1)

    .exit();
