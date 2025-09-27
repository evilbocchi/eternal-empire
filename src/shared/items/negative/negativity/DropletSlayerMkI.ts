import Difficulty from "@antivivi/jjt-difficulties";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { TweenService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import perItemPacket from "shared/item/utils/perItemPacket";

const firedPacket = perItemPacket(packet<(placementId: string) => void>());

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
        const laser = model.WaitForChild("Laser") as BasePart;
        const laserInfo = getAllInstanceInfo(laser);
        item.repeat(
            model,
            () => {
                laserInfo.Enabled = true;
                firedPacket.toAllClients(model);
                task.delay(0.5, () => (laserInfo.Enabled = false));
            },
            4,
        );
    })
    .onClientLoad((model) => {
        const laser = model.WaitForChild("Laser") as BasePart;
        const sound = laser.WaitForChild("Sound") as Sound;
        laser.Transparency = 1;
        firedPacket.fromServer(model, () => {
            sound.Play();
            laser.Transparency = 0.3;
            TweenService.Create(laser, new TweenInfo(0.5), { Transparency: 1 }).Play();
        });
    });
