import Difficulty from "@antivivi/jjt-difficulties";
import { packet } from "@rbxts/fletchette";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import perItemPacket from "shared/item/utils/perItemPacket";

const active = perItemPacket(packet<(placementId: string, on: boolean) => void>());

export = new Item(script.Name)
    .setName("Timewall")
    .setDescription("It stands in your way, merciless and unfeeling. %mul%, but is very, very, excruciatingly, slow.")
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Funds", 1e39).set("Bitcoin", 1e9).set("Dark Matter", 1e21), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("simple13579")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 3.5).set("Power", 3.5))

    .trait(Conveyor)
    .setSpeed(0.5)
    .exit()

    .onLoad((model, item) => {
        const laser = model.WaitForChild("Laser") as BasePart;
        let on = false;
        let count = 0;
        item.repeat(
            model,
            () => {
                if (on === false && ++count >= 2) {
                    count = 0;
                    on = true;
                } else {
                    on = false;
                }
                active.toAllClients(model, on);
                laser.CanCollide = on;
            },
            2,
        );
    })
    .onClientLoad((model) => {
        const laser = model.WaitForChild("Laser") as BasePart;
        active.fromServer(model, (on) => {
            laser.Transparency = on ? 0 : 0.7;
            laser.CanCollide = on;
        });
    });
