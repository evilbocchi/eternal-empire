import Difficulty from "@antivivi/jjt-difficulties";
import { TweenService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import BaseDropletSlayer from "shared/item/traits/other/BaseDropletSlayer";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

class DropletSlayerMkI extends BaseDropletSlayer {}

export = new Item(script.Name)
    .setName("Droplet Slayer Mk. I")
    .setDescription("Fires a short beam that multiplies a droplet's value by %mul% every 4 seconds.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 4000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 3))
    .exit()

    .onLoad((model, item) => {
        DropletSlayerMkI.baseLoad(model, item.trait(DropletSlayerMkI));
    })
    .onClientLoad((model) => {
        const laser = model.WaitForChild("PulsatingLaser") as BasePart;
        const sound = laser.WaitForChild("Sound") as Sound;
        laser.Transparency = 1;
        DropletSlayerMkI.activatePacket.fromServer(model, () => {
            sound.Play();
            laser.Transparency = 0.3;
            TweenService.Create(laser, new TweenInfo(0.5), { Transparency: 1 }).Play();
        });
    });
