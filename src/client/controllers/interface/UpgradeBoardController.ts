import { Controller, OnStart } from "@flamework/core";
import { PLAYER_GUI } from "client/constants";
import { UI_ASSETS, UpgradeBoardUpgradeOption } from "shared/constants";
import Items from "shared/items/Items";
import NamedUpgrade from "shared/item/NamedUpgrade";
import { Fletchette } from "shared/utils/fletchette";
import { UIController } from "../UIController";
import { BuildController } from "./BuildController";

const UpgradeBoardCanister = Fletchette.getCanister("UpgradeBoardCanister");

@Controller()
export class UpgradeBoardController implements OnStart {

    constructor(private buildController: BuildController, private uiController: UIController) {

    }

    sound(success: boolean) {
        this.uiController.playSound(success ? "Coins" : "Error");
    }

    getUpgradeAmount(upgrade: NamedUpgrade) {
        return ((UpgradeBoardCanister.upgrades.get() ?? {})[upgrade.id]) ?? 0;
    }

    loadUpgradeBoard(model: Instance) {
        if (!model.IsA("Model")) {
            return;
        }
        const itemId = model.GetAttribute("ItemId") as string | undefined;
        if (itemId === undefined) {
            return;
        }
        const item = Items.getItem(itemId);
        if (item === undefined || !item.isA("UpgradeBoard")) {
            return;
        }
        const upgradeOptionsPart = model.WaitForChild("UpgradeOptionsPart") as BasePart;
        const upgradeActionsPart = model.WaitForChild("UpgradeActionsPart") as BasePart;
        const upgradeOptionsGui = UI_ASSETS.UpgradeBoard.UpgradeOptionsGui.Clone();
        const upgradeActionsGui = UI_ASSETS.UpgradeBoard.UpgradeActionsGui.Clone();
        upgradeOptionsGui.ResetOnSpawn = false;
        upgradeActionsGui.ResetOnSpawn = false;

        const newPurchaseOption = (name: string) => {
            const purchaseOption = UI_ASSETS.UpgradeBoard.PurchaseOption.Clone();
            purchaseOption.Button.AmountLabel.Text = "Buy " + name;
            purchaseOption.Name = name;
            purchaseOption.CostLabel.Text = "Select an upgrade!";
            purchaseOption.Parent = upgradeActionsGui.PurchaseOptions;
            return purchaseOption;
        }
        const buy1 = newPurchaseOption("x1");
        const buyNext = newPurchaseOption("NEXT");
        const buyMax = newPurchaseOption("MAX");
        let selected: NamedUpgrade | undefined = undefined;
        buy1.Button.Activated.Connect(() => {
            if (selected !== undefined)
                this.sound(UpgradeBoardCanister.buyUpgrade.invoke(selected.id, this.getUpgradeAmount(selected) + 1));
        });
        const getNext = (amount: number, step?: number) => step === undefined ? undefined : amount + step - (amount % step);
        buyNext.Button.Activated.Connect(() => {
            if (selected !== undefined)
                this.sound(UpgradeBoardCanister.buyUpgrade.invoke(selected.id, getNext(this.getUpgradeAmount(selected), selected.getStep())));
        });
        buyMax.Button.Activated.Connect(() => {
            if (selected !== undefined)
                this.sound(UpgradeBoardCanister.buyUpgrade.invoke(selected.id, selected.getCap()));
        });
        const selectUpgrade = (upgrade?: NamedUpgrade) => {
            upgradeActionsGui.TitleLabel.Text = upgrade?.getName() ?? "<no upgrade selected>";
            upgradeActionsGui.DescriptionLabel.Text = upgrade?.getDescription() ?? "Select an upgrade to get started.";
            const image = upgrade?.getImage();
            upgradeActionsGui.ImageLabel.Image = image === undefined ? "" : "rbxassetid://" + image;
            updateCosts(upgrade);
            selected = upgrade;
        }
        const updateCosts = (upgrade?: NamedUpgrade) => {
            if (upgrade === undefined) {
                upgradeActionsGui.AmountLabel.Text = "";
                return;
            }
            const amount = this.getUpgradeAmount(upgrade);
            const cap = upgrade.getCap();
            const isMaxed = amount === cap;
            upgradeActionsGui.AmountLabel.Text = cap === undefined ? tostring(amount) : amount + "/" + cap;
            upgradeActionsGui.AmountLabel.TextColor3 = amount === cap ? new Color3(1, 0.83, 0.06) : new Color3(1, 1, 1);
            buy1.CostLabel.Text = "Cost: " + (isMaxed ? "MAXED" : upgrade.getPrice(amount + 1)?.tostring());
            const step = upgrade.getStep();
            const to = getNext(amount, step) ?? (amount + 1);
            buyNext.CostLabel.Text = "Cost: " + (isMaxed ? "MAXED" : upgrade.getPrice(amount + 1, to)?.tostring() + " (to " + to + ")");
            buyMax.CostLabel.Text = "Cost: " + (isMaxed ? "MAXED" : upgrade.getPrice(amount + 1, cap)?.tostring());
        }
        for (const upgrade of item.upgrades) {
            const upgradeOption = UI_ASSETS.UpgradeBoard.UpgradeOption.Clone();
            upgradeOption.ImageButton.Image = "rbxassetid://" + upgrade.image;
            upgradeOption.Name = upgrade.id;
            upgradeOption.ImageButton.Activated.Connect(() => selectUpgrade(upgrade));
            upgradeOption.Parent = upgradeOptionsGui;
        }
        const updateAmounts = (value: {[upgradeId: string]: number}) => {
            for (const uo of upgradeOptionsGui.GetChildren()) {
                if (uo?.IsA("Frame")) {
                    const upgradeOption = (uo as UpgradeBoardUpgradeOption);
                    const upgrade = NamedUpgrade.getUpgrade(upgradeOption.Name);
                    const amount = value[upgradeOption.Name];
                    upgradeOption.AmountLabel.Text = tostring(amount ?? 0);
                    upgradeOption.AmountLabel.TextColor3 = amount === upgrade?.getCap() ? new Color3(1, 0.83, 0.06) : new Color3(1, 1, 1);
                }
            }
            if (selected !== undefined) {
                updateCosts(selected);
            }
        }
        const connection = UpgradeBoardCanister.upgrades.observe((value) => updateAmounts(value));
        selectUpgrade(undefined);
        upgradeOptionsGui.Adornee = upgradeOptionsPart;
        upgradeOptionsGui.Parent = PLAYER_GUI;
        upgradeActionsGui.Adornee = upgradeActionsPart;
        upgradeActionsGui.Parent = PLAYER_GUI;
        model.Destroying.Once(() => {
            upgradeOptionsGui.Destroy();
            upgradeActionsGui.Destroy();
            connection.disconnect();
        });
    }

    onStart() {
        for (const model of this.buildController.placedItemsFolder.GetChildren()) {
            this.loadUpgradeBoard(model);
        }
        this.buildController.placedItemsFolder.ChildAdded.Connect((model) => this.loadUpgradeBoard(model));
    }
}