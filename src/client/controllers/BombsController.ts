import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnStart } from "@flamework/core";
import { CollectionService, MarketplaceService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { DETAILS_WINDOW } from "./interface/DetailsController";
import { UIController } from "client/controllers/UIController";
import { BOMBS_PRODUCTS } from "shared/devproducts/BombsProducts";
import Packets from "shared/Packets";
import { convertToHHMMSS } from "@antivivi/vrldk";

declare global {
    type BombsBoardGui = SurfaceGui & {
        BuyButton: TextButton,
        UseButton: TextButton,
        AmountLabel: TextLabel,
    };
}

@Controller()
export class BombsController implements OnStart {

    guis = new Map<BombsBoardGui, Currency>();

    constructor(private uiController: UIController) {

    }

    loadGui(bombsCurrency: Currency, boosting: Currency, gui: BombsBoardGui) {
        gui.BuyButton.Activated.Connect(() => {
            this.uiController.playSound("Click");
            MarketplaceService.PromptProductPurchase(LOCAL_PLAYER, BOMBS_PRODUCTS[boosting as keyof (typeof BOMBS_PRODUCTS)]);
        });
        gui.UseButton.Activated.Connect(() => {
            if (Packets.useBomb.invoke(bombsCurrency) === true) {
                this.uiController.playSound("Coins");
            }
            else {
                this.uiController.playSound("Error");
            }
        });
        gui.Destroying.Once(() => this.guis.delete(gui));
        this.guis.set(gui, bombsCurrency);
    }

    onStart() {
        CollectionService.GetInstanceAddedSignal("Bombs Board").Connect((board) => {
            const bombsCurrency = (board.WaitForChild("BombsCurrency") as StringValue).Value as Currency;
            const boosting = (board.WaitForChild("Boosting") as StringValue).Value as Currency;
            this.loadGui(bombsCurrency, boosting, board.WaitForChild("SurfaceGui") as BombsBoardGui);
        });

        Packets.balance.observe((value) => {
            for (const [gui, currency] of this.guis)
                gui.AmountLabel.Text = tostring(new OnoeNum(value.get(currency) ?? 0));
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