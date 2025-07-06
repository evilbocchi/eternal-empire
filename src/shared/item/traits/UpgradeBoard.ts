import { getSound } from "shared/asset/GameAssets";
import { ASSETS } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import { playSoundAtPart } from "@antivivi/vrldk";
import NamedUpgrade from "../../namedupgrade/NamedUpgrade";

declare global {
    interface ItemTraits {
        UpgradeBoard: UpgradeBoard;
    }

    type UpgradeBoardPurchaseOption = Frame & {
        Button: TextButton & {
            AmountLabel: TextLabel;
        },
        CostLabel: TextLabel;
    };

    type UpgradeBoardUpgradeOption = Frame & {
        AmountLabel: TextLabel,
        ImageButton: ImageButton;
    };

    interface UpgradeBoardAssets extends Folder {
        UpgradeActionsGui: SurfaceGui & {
            PurchaseOptions: Frame,
            ImageLabel: ImageLabel,
            DescriptionLabel: TextLabel,
            TitleLabel: TextLabel,
            AmountLabel: TextLabel;
        },
        UpgradeOptionsGui: SurfaceGui,
        PurchaseOption: UpgradeBoardPurchaseOption,
        UpgradeOption: UpgradeBoardUpgradeOption;
    }

    interface Assets {
        UpgradeBoard: UpgradeBoardAssets;
    }
}

const getUpgradeAmount = (upgrade: NamedUpgrade) => {
    return Packets.upgrades.get().get(upgrade.id) ?? 0;
};

export default class UpgradeBoard extends ItemTrait {

    static clientLoad(model: Model, upgradeBoard: UpgradeBoard, player: Player) {
        const item = upgradeBoard.item;

        const PLAYER_GUI = player.WaitForChild("PlayerGui") as PlayerGui;
        const upgradeOptionsPart = model.WaitForChild("UpgradeOptionsPart", math.huge) as BasePart;
        const upgradeActionsPart = model.WaitForChild("UpgradeActionsPart") as BasePart;
        const upgradeOptionsGui = ASSETS.UpgradeBoard.UpgradeOptionsGui.Clone();
        const upgradeActionsGui = ASSETS.UpgradeBoard.UpgradeActionsGui.Clone();
        upgradeOptionsGui.ResetOnSpawn = false;
        upgradeActionsGui.ResetOnSpawn = false;

        const newPurchaseOption = (name: string) => {
            const purchaseOption = ASSETS.UpgradeBoard.PurchaseOption.Clone();
            purchaseOption.Button.AmountLabel.Text = "Buy " + name;
            purchaseOption.Name = name;
            purchaseOption.CostLabel.Text = "Select an upgrade!";
            purchaseOption.Parent = upgradeActionsGui.PurchaseOptions;
            return purchaseOption;
        };
        const buy1 = newPurchaseOption("x1");
        const buyNext = newPurchaseOption("NEXT");
        const buyMax = newPurchaseOption("MAX");
        let selected: NamedUpgrade | undefined = undefined;

        const sound = (success: boolean) => {
            const sound = success ? getSound("UpgradeBought.mp3") : getSound("Error.mp3");
            playSoundAtPart(model.PrimaryPart, sound);
        };
        buy1.Button.Activated.Connect(() => {
            if (selected !== undefined)
                sound(Packets.buyUpgrade.invoke(selected.id, getUpgradeAmount(selected) + 1));
        });
        const getNext = (amount: number, step?: number) => step === undefined ? amount + 1 : amount + step - (amount % step);
        buyNext.Button.Activated.Connect(() => {
            if (selected !== undefined)
                sound(Packets.buyUpgrade.invoke(selected.id, getNext(getUpgradeAmount(selected), selected.step)));
        });
        buyMax.Button.Activated.Connect(() => {
            if (selected !== undefined)
                sound(Packets.buyUpgrade.invoke(selected.id, selected.cap));
        });
        const selectUpgrade = (upgrade?: NamedUpgrade) => {
            upgradeActionsGui.TitleLabel.Text = upgrade?.name ?? "<no upgrade selected>";
            upgradeActionsGui.DescriptionLabel.Text = upgrade?.description ?? "Select an upgrade to get started.";
            const image = upgrade?.image;
            upgradeActionsGui.ImageLabel.Image = image === undefined ? "" : image;
            updateCosts(upgrade);
            selected = upgrade;
        };
        const updateCosts = (upgrade?: NamedUpgrade) => {
            if (upgrade === undefined) {
                upgradeActionsGui.AmountLabel.Text = "";
                return;
            }
            const amount = getUpgradeAmount(upgrade);
            const cap = upgrade.cap;
            const isMaxed = amount === cap;
            upgradeActionsGui.AmountLabel.Text = cap === undefined ? tostring(amount) : amount + "/" + cap;
            upgradeActionsGui.AmountLabel.TextColor3 = amount === cap ? new Color3(1, 0.83, 0.06) : new Color3(1, 1, 1);
            buy1.CostLabel.Text = "Cost: " + (isMaxed ? "MAXED" : upgrade.getPrice(amount + 1)?.toString());
            const step = upgrade.step;
            const to = getNext(amount, step) ?? (amount + 1);
            buyNext.CostLabel.Text = "Cost: " + (isMaxed ? "MAXED" : upgrade.getPrice(amount + 1, to)?.toString() + " (to " + to + ")");
            buyMax.CostLabel.Text = "Cost: " + (isMaxed ? "MAXED" : upgrade.getPrice(amount + 1, cap)?.toString());
        };
        for (const upgrade of upgradeBoard.upgrades) {
            const upgradeOption = ASSETS.UpgradeBoard.UpgradeOption.Clone();
            upgradeOption.ImageButton.Image = upgrade.image ?? "";
            upgradeOption.Name = upgrade.id;
            upgradeOption.ImageButton.Activated.Connect(() => selectUpgrade(upgrade));
            upgradeOption.Parent = upgradeOptionsGui;
        }
        const updateAmounts = (value: Map<string, number>) => {
            for (const uo of upgradeOptionsGui.GetChildren()) {
                if (uo?.IsA("Frame")) {
                    const upgradeOption = (uo as UpgradeBoardUpgradeOption);
                    const upgrade = NamedUpgrades.ALL_UPGRADES.get(upgradeOption.Name);
                    const amount = value.get(upgradeOption.Name);
                    upgradeOption.AmountLabel.Text = tostring(amount ?? 0);
                    upgradeOption.AmountLabel.TextColor3 = amount === upgrade?.cap ? new Color3(1, 0.83, 0.06) : new Color3(1, 1, 1);
                }
            }
            if (selected !== undefined) {
                updateCosts(selected);
            }
        };
        const connection = Packets.upgrades.observe((value) => updateAmounts(value));
        selectUpgrade(undefined);
        upgradeOptionsGui.Adornee = upgradeOptionsPart;
        upgradeOptionsGui.Parent = PLAYER_GUI;
        upgradeActionsGui.Adornee = upgradeActionsPart;
        upgradeActionsGui.Parent = PLAYER_GUI;
        model.Destroying.Connect(() => connection.disconnect());
    }

    upgrades = new Array<NamedUpgrade>();

    constructor(item: Item) {
        super(item);
        item.onClientLoad((model, item, player) => UpgradeBoard.clientLoad(model, this, player));
    }

    addUpgrade(upgrade: NamedUpgrade) {
        this.upgrades.push(upgrade);
        return this;
    }
}