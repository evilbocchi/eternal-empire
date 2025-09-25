import { weldModel } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { TweenService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Operative from "shared/item/traits/Operative";
import Packets from "shared/Packets";

declare global {
    interface PlacedItem {
        lastCollection?: number;
    }
}

const lastCollectionPacket = packet<(placementId: string, lastCollection: number) => void>();
const collectPacket = packet<(placementId: string) => void>();

/**
 * A bin is an item that enables offline progress, generating revenue while the player is not actively playing the game.
 */
export default class Bin extends Operative {
    limit = 3600 * 3;
    static readonly lastCollectionPerPlacementId = new Map<string, number>();

    static load(model: Model, bin: Bin) {
        const item = bin.item;
        const CurrencyService = Server.Currency;
        const ItemService = Server.Item;
        const placedItem = ItemService.getPlacedItem(model.Name);
        if (placedItem === undefined) return;
        placedItem.lastCollection ??= tick();

        lastCollectionPacket.toAllClients(model.Name, placedItem.lastCollection);

        const onCollected = () => {
            const lastCollection = placedItem.lastCollection;
            if (lastCollection === undefined) return;
            const diff = math.min(tick() - lastCollection, bin.limit);
            placedItem.lastCollection = tick();
            const revenue = bin.mul?.mul(CurrencyService.getOfflineRevenue()).mul(diff);
            if (revenue === undefined) return;
            lastCollectionPacket.toAllClients(model.Name, placedItem.lastCollection);
            print(`Collected ${revenue} from ${item.name}`);
            CurrencyService.incrementAll(revenue.amountPerCurrency);
            Packets.showDifference.toAllClients(revenue.amountPerCurrency);
        };
        const connection = collectPacket.fromClient((_, placementId) => {
            if (placementId !== model.Name) return;
            onCollected();
            collectPacket.toAllClients(placementId);
        });
        model.Destroying.Once(() => connection.Disconnect());
    }

    static clientLoad(model: Model, bin: Bin) {
        const fill = model.WaitForChild("Fill") as Part;
        const fillPosition = fill.Position; // for 1 height
        const fillSize = fill.Size;
        const updateHeight = () => {
            const lastCollection = this.lastCollectionPerPlacementId.get(model.Name) ?? tick();
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
            collectPacket.toServer(model.Name);
        });

        const onCollected = () => {
            playSound("GiantPress.mp3", clickPart);
            TweenService.Create(clickPart, new TweenInfo(0.2), {
                CFrame: unclickedCFrame.mul(new CFrame(0, 0, 0.5)),
            }).Play();
            task.wait(0.2);
            TweenService.Create(clickPart, new TweenInfo(0.6), { CFrame: unclickedCFrame }).Play();
        };
        const connection = collectPacket.fromServer((placementId) => {
            if (placementId !== model.Name) return;
            onCollected();
        });
        model.Destroying.Once(() => connection.Disconnect());
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Bin.load(model, this));
    }
}
