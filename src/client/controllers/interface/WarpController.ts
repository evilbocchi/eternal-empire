import { Controller, OnInit } from "@flamework/core";
import { WARP_WINDOW } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { AREAS } from "shared/constants";
import { Fletchette } from "shared/utils/fletchette";

@Controller()
export class WarpController implements OnInit {

    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private hotkeysController: HotkeysController) {

    }

    onInit() {
        const AreaCanister = Fletchette.getCanister("AreaCanister");
        const keys = new Map<keyof (typeof AREAS), Enum.KeyCode>();
        keys.set("BarrenIslands", Enum.KeyCode.One);
        keys.set("SlamoVillage", Enum.KeyCode.Two);

        const buttons = WARP_WINDOW.GetChildren();
        for (const button of buttons) {
            if (!button.IsA("ImageButton"))
                continue;
            const areaId = button.Name as keyof (typeof AREAS);
            this.hotkeysController.setHotkey(button, keys.get(areaId)!, () => {
                if (WARP_WINDOW.Visible) {
                    const success = AreaCanister.tpToArea.invoke(areaId);
                    if (success) {
                        this.uiController.playSound("Teleport");
                        this.adaptiveTabController.hideAdaptiveTab();
                    }
                    else {
                        this.uiController.playSound("Error");
                    }
                    return true;
                }
                return false;
            }, `Teleport to ${AREAS[areaId].name}`, 3);
        }
    }
}