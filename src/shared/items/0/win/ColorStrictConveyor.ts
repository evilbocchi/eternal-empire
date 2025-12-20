import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { packet, property } from "@rbxts/fletchette";
import { Server } from "shared/api/APIExpose";
import { playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import setDropletVelocity from "shared/item/utils/setDropletVelocity";
import perItemPacket from "shared/item/utils/perItemPacket";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";
import Class0Shop from "shared/items/0/Class0Shop";

declare global {
    interface PlacedItem {
        currency?: Currency;
    }
}

const clickedPacket = perItemPacket(packet<(placementId: string) => void>());
const modePacket = property<Currency>();
const getSortingPoint = (model: Model) => model.WaitForChild("SortingPoint") as BasePart;

export = new Item(script.Name)
    .setName("Currency Strict Conveyor")
    .setDescription(
        "A conveyor that sorts droplets based on their currency. It has two outputs: one for the selected currency and another for all other currencies. Click the button to change the selected currency.",
    )
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Power", 5e12), 1, 5)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Conveyor)
    .setSpeed(5)
    .exit()

    .onLoad((model) => {
        const forward = model.GetPivot().LookVector.Unit;

        const placedItem = Server.Item.getPlacedItem(model.Name)!;
        placedItem.currency ??= "Funds";
        const modes = ["Funds", "Power", "Bitcoin", "Skill"] as Currency[];
        modePacket.set(placedItem.currency);

        clickedPacket.fromClient(model, (player) => {
            if (!Server.Permissions.hasPermission(player, "build")) return;

            let currentIndex = 0;
            for (let i = 0; i < modes.size(); i++) {
                if (modes[i] === placedItem.currency) {
                    currentIndex = i;
                    break;
                }
            }
            const nextIndex = (currentIndex + 1) % modes.size();
            const currency = modes[nextIndex];
            placedItem.currency = currency;
            modePacket.set(currency);
            clickedPacket.toAllClients(model);
        });

        const touched = new Set<BasePart>();

        VirtualCollision.onDropletTouched(model, getSortingPoint(model), (part, instanceInfo) => {
            if (instanceInfo.dropletId === undefined || touched.has(part)) return;
            const droplet = Droplet.getDroplet(instanceInfo.dropletId);
            if (droplet === undefined) throw "Unknown droplet ID: " + instanceInfo.dropletId;

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

            if (bestCurrency !== placedItem.currency) return;

            setDropletVelocity(part, forward.mul(part.Mass).mul(40));
        });
    })
    .onClientLoad((model) => {
        const modeButton = model.WaitForChild("Mode") as BasePart;
        (modeButton.WaitForChild("ClickDetector") as ClickDetector).MouseClick.Connect(() => {
            clickedPacket.toServer(model);
        });

        modePacket.observe((currency) => {
            modeButton.Color = CURRENCY_DETAILS[currency].color;
        });

        clickedPacket.fromServer(model, () => {
            playSound("SwitchFlick.mp3", modeButton);
        });
    });
