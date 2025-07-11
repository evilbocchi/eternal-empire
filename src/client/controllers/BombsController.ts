import { Controller, OnStart } from "@flamework/core";
import { MarketplaceService, Workspace } from "@rbxts/services";
import { DETAILS_WINDOW, LOCAL_PLAYER } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AREAS, BOMBS_PRODUCTS, BombsBoardGui } from "shared/constants";
import { Fletchette } from "@antivivi/fletchette";
import { OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS } from "shared/utils/vrldk/NumberAbbreviations";

@Controller()
export class BombsController implements OnStart {

    constructor(private uiController: UIController) {

    }

    onStart() {
        const BombsCanister = Fletchette.getCanister("BombsCanister");
        const CurrencyCanister = Fletchette.getCanister("CurrencyCanister");
        const fundsBombGui = AREAS.SlamoVillage.areaFolder.WaitForChild("BombsBoard").WaitForChild("SurfaceGui") as BombsBoardGui;
        if (fundsBombGui === undefined)
            error("Whattt");
        
        fundsBombGui.BuyButton.Activated.Connect(() => {
            this.uiController.playSound("Click");
            MarketplaceService.PromptProductPurchase(LOCAL_PLAYER, BOMBS_PRODUCTS.Funds);
        });
        fundsBombGui.UseButton.Activated.Connect(() => {
            if (BombsCanister.useBomb.invoke("Funds Bombs")) {
                this.uiController.playSound("Coins");
            }
            else {
                this.uiController.playSound("Error");
            }
        });

        CurrencyCanister.balance.observe((value) => {
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
                    DETAILS_WINDOW.FundsBombLabel.Text = `Funds Bomb Active (1.2x): ${convertToHHMMSS(fundsBombTime - currentTime)}`;
                    DETAILS_WINDOW.FundsBombLabel.Visible = true;
                }
            }
        });
    }
}