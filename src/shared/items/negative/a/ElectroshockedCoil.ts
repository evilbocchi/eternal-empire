import Difficulty from "@antivivi/jjt-difficulties";
import { packet } from "@rbxts/fletchette";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import WhiteGem from "shared/items/excavation/WhiteGem";

const modePacket = packet<number>();

export = new Item(script.Name)
    .setName("Electroshocked Coil")
    .setDescription(
        "Has increasing effects as Power milestones are reached: +3 W by default, +50 W at 1M W and +1000 W at 1T W.",
    )
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Funds", 1e12))
    .setRequiredItemAmount(WhiteGem, 35)
    .setRequiredItemAmount(Crystal, 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("Trabitic")
    .persists()

    .trait(Upgrader)
    .trait(Conveyor)
    .setSpeed(3)
    .exit()

    .onInit((item) => {
        const upgrader = item.trait(Upgrader);
        const first = new CurrencyBundle().set("Power", 3);
        const second = new CurrencyBundle().set("Power", 50);
        const third = new CurrencyBundle().set("Power", 1000);
        let lastMode = -1;
        let mode = 0;

        const connection = Server.Currency.balanceChanged.connect((balance) => {
            const power = balance.get("Power");
            if (power === undefined || power.lessThan(1000000)) {
                upgrader.setAdd(first);
                mode = 1;
            } else if (power.lessThan(1e12)) {
                upgrader.setAdd(second);
                mode = 2;
            } else {
                upgrader.setAdd(third);
                mode = 3;
            }
            if (mode !== lastMode) {
                lastMode = mode;
                modePacket.set(mode);
            }
        });
        eat(connection, "Disconnect");
    })
    .onClientLoad((model) => {
        const rings = [model.WaitForChild(1), model.WaitForChild(2), model.WaitForChild(3)] as BasePart[];
        modePacket.observe((mode) => {
            for (let i = 0; i < 3; i++) {
                const ring = rings[i];
                ring.Transparency = mode > i ? 0 : 0.7;
            }
        });
    });
