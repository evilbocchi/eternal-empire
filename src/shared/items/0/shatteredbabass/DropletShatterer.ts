import { getInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import Furnace from "shared/item/traits/Furnace";
import Class0Shop from "shared/items/0/Class0Shop";
import Packets from "shared/Packets";

export = new Item(script.Name)
    .setName("Droplet Shatterer")
    .setDescription("Produces a %val% droplet every time a droplet is processed through the attached furnace.")
    .setDifficulty(Difficulty.ShatteredBabass)
    .setPrice(new CurrencyBundle().set("Power", 70e24), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Dropper)
    .setDroplet(Droplet.ShatteredDroplet)

    .trait(Furnace)
    .setMul(CurrencyBundle.ones().mul(0))
    .exit()

    .onLoad((model) => {
        setInstanceInfo(model, "FurnaceProcessed", (_result, _genericResult, droplet) => {
            getInstanceInfo(model.WaitForChild("Drop"), "Instantiator")?.();
            Packets.dropletBurnt.toAllClients(droplet.Name, new Map());
        });
    });
