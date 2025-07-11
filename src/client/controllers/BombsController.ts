import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnStart } from "@flamework/core";
import { MarketplaceService, Workspace } from "@rbxts/services";
import { DETAILS_WINDOW, LOCAL_PLAYER } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AREAS, BOMBS_PRODUCTS, BombsBoardGui } from "shared/constants";
import Packets from "shared/network/Packets";
import { convertToHHMMSS } from "shared/utils/vrldk/NumberAbbreviations";

@Controller()
export class BombsController implements OnStart {

    constructor(private uiController: UIController) {

    }

    onStart() {
        const fundsBombGui = AREAS.SlamoVillage.areaFolder.WaitForChild("BombsBoard").WaitForChild("SurfaceGui") as BombsBoardGui;
        if (fundsBombGui === undefined)
            throw "Whattt";
        
        fundsBombGui.BuyButton.Activated.Connect(() => {
            this.uiController.playSound("Click");
            MarketplaceService.PromptProductPurchase(LOCAL_PLAYER, BOMBS_PRODUCTS.Funds);
        });
        fundsBombGui.UseButton.Activated.Connect(() => {
            if (Packets.useBomb.invoke("Funds Bombs") === true) {
                this.uiController.playSound("Coins");
            }
            else {
                this.uiController.playSound("Error");
            }
        });

        Packets.balance.observe((value) => {
            fundsBombGui.AmountLabel.Text = tostring(new OnoeNum(value.get("Funds Bombs") ?? 0));
        });

        task.spawn(() => {
            while (task.wait(1)) {
                const currentTime = os.time();
                const fundsBombTime = Workspace.GetAttribute("FundsBombTime") as number | undefined;
                if (fundsBombTime === undefined || fundsBombTime < currentTime) {
                    DETAILS_WINDOW.FundsBombLabel.Visible = false;
                }
                else {
                    DETAILS_WINDOW.FundsBombLabel.Text = `Funds Bomb Active (x2): ${convertToHHMMSS(fundsBombTime - currentTime)}`;
                    DETAILS_WINDOW.FundsBombLabel.Visible = true;
                }
            }
        });
    }
}