import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { getAllInstanceInfo, playSoundAtPart } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { getSound } from "shared/asset/GameAssets";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import ItemUtils, { Server } from "shared/item/ItemUtils";
import Conveyor from "shared/item/traits/conveyor/Conveyor";

declare global {
    interface PlacedItem {
        currency?: Currency;
    }
}

export = new Item(script.Name)
    .setName("Currency Strict Conveyor")
    .setDescription("A conveyor that sorts droplets based on their currency. It has two outputs: one for the selected currency and another for all other currencies. Click the button to change the selected currency.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Power", 5e12), 1, 5)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .trait(Conveyor)
    .setSpeed(5)
    .exit()

    .onLoad((model) => {
        const forward = model.GetPivot().LookVector.Unit;
        const sortingPoint = model.WaitForChild("SortingPoint") as BasePart;
        sortingPoint.CanTouch = true;

        const modeButton = model.WaitForChild("Mode") as BasePart;
        const placedItem = Server.Item.getPlacedItem(model.Name)!;
        placedItem.currency ??= "Funds";
        const updateMode = () => modeButton.Color = CURRENCY_DETAILS[placedItem.currency!].color;
        updateMode();
        const modes = ["Funds", "Power", "Bitcoin", "Skill"] as Currency[];

        (modeButton.WaitForChild("ClickDetector") as ClickDetector).MouseClick.Connect(() => {
            let currentIndex = 0;
            for (let i = 0; i < modes.size(); i++) {
                if (modes[i] === placedItem.currency) {
                    currentIndex = i;
                    break;
                }
            }
            const nextIndex = (currentIndex + 1) % modes.size();
            placedItem.currency = modes[nextIndex];
            updateMode();
            playSoundAtPart(modeButton, getSound("SwitchFlick.mp3"));
        });

        const touched = new Set<BasePart>();
        sortingPoint.Touched.Connect((part) => {
            const instanceInfo = getAllInstanceInfo(part);
            if (instanceInfo.DropletId === undefined || touched.has(part))
                return;
            const droplet = Droplet.getDroplet(instanceInfo.DropletId);
            if (droplet === undefined)
                throw "Unknown droplet ID: " + instanceInfo.DropletId;

            touched.add(part);
            task.delay(0.5, () => touched.delete(part));

            const value = droplet.value;
            let bestCurrency: Currency | undefined;
            let bestAmount: OnoeNum | undefined;
            for (const [currency, amount] of value.amountPerCurrency) {
                if (bestAmount === undefined || amount.moreThan(bestAmount)) {
                    bestCurrency = currency;
                    bestAmount = amount;
                }
            }

            if (bestCurrency !== placedItem.currency)
                return;

            ItemUtils.applyImpulse(part, forward.mul(part.Mass).mul(40));
        });
    });