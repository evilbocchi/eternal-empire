import Signal from "@antivivi/lemon-signal";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import React, { useEffect } from "@rbxts/react";
import RepairTimingMiniGame from "client/components/item/RepairTimingMiniGame";
import SingleDocumentManager from "client/components/sidebar/SingleDocumentManager";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import { showErrorToast } from "client/components/toast/ToastService";
import TechWindow from "client/components/window/TechWindow";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMonoBold } from "shared/asset/GameFonts";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

export class RepairManager {
    static model: Model | undefined;
    static modelInfo: InstanceInfo | undefined;
    static placementId: string | undefined;
    static item: Item | undefined;

    static readonly updated = new Signal();

    static setRepairing(toRepair: Model) {
        this.model = toRepair;
        this.modelInfo = getAllInstanceInfo(toRepair);
        this.placementId = toRepair.Name;
        const itemId = this.modelInfo.ItemId;
        if (itemId) {
            this.item = Items.getItem(itemId);
        }
        SingleDocumentManager.open("Repair");
    }
}

export default function RepairWindow() {
    const { id, visible, closeDocument } = useSingleDocument({ id: "Repair" });
    const [activeItem, setActiveItem] = React.useState<Item | undefined>();

    useEffect(() => {
        const connection = Packets.itemRepairCompleted.fromServer((placementId) => {
            if (placementId === RepairManager.placementId) {
                playSound("repair/Complete.mp3");
            }
        });
        return () => connection.Disconnect();
    }, []);

    useEffect(() => {
        const connection = RepairManager.updated.connect(() => {
            setActiveItem(RepairManager.item);
        });
        return () => connection.Disconnect();
    }, []);

    const handleSuccess = (score: number) => {
        const placementId = RepairManager.placementId;
        if (placementId === undefined) return;

        const accepted = Packets.repairItem.toServer(placementId);
        if (accepted === false) {
            showErrorToast("Repair request failed. Try again.");
        }
    };

    return (
        <TechWindow title="Repair Station" icon={getAsset("assets/Broken.png")} id={id} visible={visible}>
            <textlabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(1, -10, 0.4, 0)}
                Text={activeItem?.name.upper() ?? "Unknown Item"}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextTransparency={0.9}
                TextScaled={true}
                ZIndex={-5}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(200, 200, 200)),
                        ])
                    }
                />
            </textlabel>
            <RepairTimingMiniGame onSuccess={handleSuccess} />
        </TechWindow>
    );
}
