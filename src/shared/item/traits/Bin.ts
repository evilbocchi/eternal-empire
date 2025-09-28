import { weldModel } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { TweenService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Operative from "shared/item/traits/Operative";
import perItemPacket, { perItemProperty } from "shared/item/utils/perItemPacket";
import Packets from "shared/Packets";

declare global {
    interface PlacedItem {
        lastCollection?: number;
    }
}

const lastCollectionPacket = perItemProperty(
    packet<(placementId: string, lastCollection: number) => void>(),
    packet<(placementId: string) => number>(),
);
const collectPacket = perItemPacket(packet<(placementId: string) => void>());

/**
 * A bin is an item that enables offline progress, generating revenue while the player is not actively playing the game.
 */
export default class Bin extends Operative {
    limit = 3600 * 3;

    static load(model: Model, bin: Bin) {
        const item = bin.item;
        const CurrencyService = Server.Currency;
        const ItemService = Server.Item;
        const placedItem = ItemService.getPlacedItem(model.Name);
        if (placedItem === undefined) return;
        placedItem.lastCollection ??= tick();

        const onCollected = () => {
            const lastCollection = placedItem.lastCollection;
            if (lastCollection === undefined) return;
            const diff = math.min(tick() - lastCollection, bin.limit);
            placedItem.lastCollection = tick();
            const revenue = bin.mul?.mul(CurrencyService.getOfflineRevenue()).mul(diff);
            if (revenue === undefined) return;
            lastCollectionPacket.set(model, placedItem.lastCollection);
            print(`Collected ${revenue} from ${item.name}`);
            CurrencyService.incrementAll(revenue.amountPerCurrency);
            Packets.showDifference.toAllClients(revenue.amountPerCurrency);
        };
        collectPacket.fromClient(model, () => {
            onCollected();
            collectPacket.toAllClients(model);
        });
        lastCollectionPacket.set(model, placedItem.lastCollection);
    }

    static clientLoad(model: Model, bin: Bin) {
        const fill = model.WaitForChild("Fill") as Part;
        const fillPosition = fill.Position; // for 1 height
        const fillSize = fill.Size;
        let lastCollection = tick();
        lastCollectionPacket.observe(model, (lc) => {
            lastCollection = lc;
            updateHeight();
        });
        const updateHeight = () => {
            // adjust fill height and position based on last collection time
            const percentage = math.clamp((tick() - lastCollection) / bin.limit, 0, 1);
            const fillHeight = percentage * 20;
            fill.Size = new Vector3(fillSize.X, fillHeight, fillSize.Z);
            fill.Position = fillPosition.add(new Vector3(0, fillHeight / 2 - 0.5, 0));
        };
        bin.item.repeat(model, updateHeight, 1);

        const button = model.WaitForChild("Button") as Model;
        weldModel(button);
        const clickPart = button.PrimaryPart!;
        const clickDetector = clickPart.WaitForChild("ClickDetector") as ClickDetector;
        const unclickedCFrame = clickPart.CFrame;

        clickDetector.MouseClick.Connect(() => {
            collectPacket.toServer(model);
        });

        collectPacket.fromServer(model, () => {
            playSound("GiantPress.mp3", clickPart);
            TweenService.Create(clickPart, new TweenInfo(0.2), {
                CFrame: unclickedCFrame.mul(new CFrame(0, 0, 0.5)),
            }).Play();
            task.wait(0.2);
            TweenService.Create(clickPart, new TweenInfo(0.6), { CFrame: unclickedCFrame }).Play();
        });
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Bin.load(model, this));
    }
}
