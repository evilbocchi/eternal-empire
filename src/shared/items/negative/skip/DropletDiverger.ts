import { OnoeNum } from "@antivivi/serikanum";
import { getInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import setDropletVelocity from "shared/item/utils/setDropletVelocity";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import XLWool from "shared/items/negative/relax/XLWool";

export = new Item(script.Name)
    .setName("Droplet Diverger")
    .setDescription("Used to separate Funds and Power droplets into different streams.")
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Power", 1e9))
    .setRequiredItemAmount(XLWool, 2)
    .setRequiredItemAmount(ExcavationStone, 20)
    .setRequiredItemAmount(WhiteGem, 2)
    .addPlaceableArea("BarrenIslands")
    .setCreator("Alexanderloney")
    .persists()

    .trait(Upgrader)
    .trait(Conveyor)
    .setSpeed(4)

    .exit()

    .onLoad((model) => {
        const right = model.GetPivot().mul(CFrame.Angles(0, math.pi / 2, 0)).LookVector.Unit;

        const connection = getInstanceInfo(model, "OnUpgraded")?.connect((dropletModel) => {
            const dropletId = getInstanceInfo(dropletModel, "DropletId");
            if (dropletId === undefined) return;
            const droplet = Droplet.getDroplet(dropletId);
            if (droplet === undefined) throw "Droplet not found for id: " + dropletId;

            const value = droplet.value;
            let bestCurrency: Currency | undefined;
            let bestValue: OnoeNum | undefined;
            for (const [currency, amount] of value.amountPerCurrency) {
                if (bestValue === undefined || amount.moreThan(bestValue)) {
                    bestValue = amount;
                    bestCurrency = currency;
                }
            }
            if (bestCurrency === undefined) return;

            let side: number;
            switch (bestCurrency) {
                case "Funds":
                    side = 1;
                    break;
                case "Power":
                    side = -1;
                    break;
                default:
                    side = math.random(0, 1) * 2 - 1;
                    break;
            }
            if (dropletModel.Anchored) {
                return;
            }

            const impulse = right.mul(side).mul(dropletModel.Mass).mul(25);
            setDropletVelocity(dropletModel, impulse);
        });
        eat(() => {
            connection?.Disconnect();
        });
    });
