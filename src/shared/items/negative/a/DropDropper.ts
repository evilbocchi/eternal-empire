import { getInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import Furnace from "shared/item/traits/Furnace";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import Packets from "shared/Packets";

export = new Item(script.Name)
    .setName("Recycling Dropper")
    .setDescription(
        "Produces a %val% droplet every time a droplet is processed through the attached furnace. No need for conjoined droppers anymore.",
    )
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Funds", 6.5e12), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.CommunismDroplet)

    .trait(Furnace)
    .calculatesFurnace(false)
    .exit()

    .onLoad((model) => {
        setInstanceInfo(model, "FurnaceProcessed", (_result, droplet) => {
            getInstanceInfo(model.WaitForChild("Drop"), "Instantiator")?.();
            Packets.dropletBurnt.toAllClients(droplet.Name, new Map());
        });
    });
