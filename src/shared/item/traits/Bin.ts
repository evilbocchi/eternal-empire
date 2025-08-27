import { weldModel } from "@antivivi/vrldk";
import { TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import Operative from "shared/item/traits/Operative";
import Packets from "shared/Packets";

declare global {
    interface PlacedItem {
        lastCollection?: number;
    }
}


/**
 * A bin is an item that enables offline progress, generating revenue while the player is not actively playing the game.
 */
export default class Bin extends Operative {

    static load(model: Model, bin: Bin) {
        const item = bin.item;
        const CurrencyService = Server.Currency;
        const ItemService = Server.Item;
        const placedItem = ItemService.getPlacedItem(model.Name);
        if (placedItem === undefined)
            return;
        placedItem.lastCollection ??= tick();

        const fill = model.WaitForChild("Fill") as Part;
        const fillPosition = fill.Position; // for 1 height]
        const fillSize = fill.Size;
        const button = model.WaitForChild("Button") as Model;
        const clickPart = button.PrimaryPart!;
        weldModel(button);
        const clickDetector = clickPart.WaitForChild("ClickDetector") as ClickDetector;
        const unclickedCFrame = clickPart.CFrame;

        const limit = 3600 * 3;

        const updateHeight = () => {
            // adjust fill height and position based on last collection time
            const lastCollection = placedItem.lastCollection;
            if (lastCollection === undefined) {
                placedItem.lastCollection = tick();
                return;
            }
            const percentage = math.clamp((tick() - lastCollection) / limit, 0, 1);
            const fillHeight = percentage * 20;
            fill.Size = new Vector3(fillSize.X, fillHeight, fillSize.Z);
            fill.Position = fillPosition.add(new Vector3(0, fillHeight / 2 - 0.5, 0));
        };
        item.repeat(model, updateHeight, 1);
        updateHeight();

        clickDetector.MouseClick.Connect(() => {
            const lastCollection = placedItem.lastCollection;
            if (lastCollection === undefined)
                return;
            const diff = math.min(tick() - lastCollection, limit);
            placedItem.lastCollection = tick();
            const revenue = bin.mul?.mul(CurrencyService.getOfflineRevenue()).mul(diff);
            if (revenue === undefined)
                return;
            updateHeight();
            print(`Collected ${revenue} from ${item.name}`);
            CurrencyService.incrementAll(revenue.amountPerCurrency);
            Packets.showDifference.fireAll(revenue.amountPerCurrency);
            playSound("GiantPress.mp3", clickPart);
            TweenService.Create(clickPart, new TweenInfo(0.2), { CFrame: unclickedCFrame.mul(new CFrame(0, 0, 0.5)) }).Play();
            task.wait(0.2);
            TweenService.Create(clickPart, new TweenInfo(0.6), { CFrame: unclickedCFrame }).Play();
        });
    }



    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Bin.load(model, this));
    }
}