import { Controller, OnInit } from "@flamework/core";
import HotkeysController from "client/controllers/core/HotkeysController";
import AdaptiveTabController, { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/core/AdaptiveTabController";
import UIController from "client/controllers/core/UIController";
import { AREAS } from "shared/Area";
import Packets from "shared/Packets";

export const WARP_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Warp") as Frame & {
    [area in AreaId]: ImageButton
};

@Controller()
export default class WarpController implements OnInit {

    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private hotkeysController: HotkeysController) {

    }

    onInit() {
        const keys = new Map<AreaId, Enum.KeyCode>();
        keys.set("BarrenIslands", Enum.KeyCode.One);
        keys.set("SlamoVillage", Enum.KeyCode.Two);

        const buttons = WARP_WINDOW.GetChildren();
        for (const button of buttons) {
            if (!button.IsA("ImageButton"))
                continue;
            const areaId = button.Name as AreaId;
            this.hotkeysController.setHotkey(button, keys.get(areaId)!, () => {
                if (WARP_WINDOW.Visible) {
                    const success = Packets.tpToArea.invoke(areaId);
                    if (success) {
                        this.uiController.playSound("Teleport.mp3");
                        this.adaptiveTabController.hideAdaptiveTab();
                    }
                    else {
                        this.uiController.playSound("Error.mp3");
                    }
                    return true;
                }
                return false;
            }, `Teleport to ${AREAS[areaId].name}`, 3);
        }
    }
}