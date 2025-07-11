import { OnStart, Service } from "@flamework/core";
import { BadgeService, Players } from "@rbxts/services";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import Area from "shared/Area";
import Difficulty from "shared/Difficulty";
import { AREAS, Inventory, PlacedItem } from "shared/constants";
import Item from "shared/item/Item";
import NamedUpgrade from "shared/item/NamedUpgrade";
import Items from "shared/items/Items";
import { Fletchette, RemoteSignal, Signal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { GameAssetService } from "./GameAssetService";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";
import { ItemsService } from "./serverdata/ItemsService";

declare global {
    interface FletchetteCanisters {
        ResetCanister: typeof ResetCanister;
    }
}

const trillion = new InfiniteMath([1, 12]);
const ResetCanister = Fletchette.createCanister("ResetCanister", {
    skillificating: new RemoteSignal<(amount: InfiniteMath, currency: Currency) => void>(),
});

@Service()
export class ResetService implements OnStart {

    reset = new Signal<(player: Player, layer: string, amount: InfiniteMath, currency: Currency) => void>();
    skillificationGain = AREAS.SlamoVillage.areaFolder.WaitForChild("SkillifyBoard").WaitForChild("SurfaceGui")
        .WaitForChild("DifficultyLabel").WaitForChild("Frame").WaitForChild("GainLabel") as TextLabel;
    skillificationPart = AREAS.SlamoVillage.areaFolder.WaitForChild("Skillification") as BasePart;
    skillificationMsg = this.skillificationPart.WaitForChild("BillboardGui").WaitForChild("TextLabel") as TextLabel;

    constructor(private dataService: DataService, private itemsService: ItemsService, private currencyService: CurrencyService, 
        private gameAssetService: GameAssetService, private upgradeBoardService: UpgradeBoardService) {

    }

    /**
     * Returns true if the itemId can be placed in the area, or if it is undefined.
     * 
     * @param itemId Item Id
     * @param area Area
     * @returns Whether the item can be placed in the area
     */
    hasArea(item: Item | undefined, area: Area) {
        return item === undefined || item.placeableAreas.includes(area);
    }

    shouldRemove(itemId: string, area: Area) {
        const item = Items.getItem(itemId)!;
        const hasArea = this.hasArea(item, area);
        return hasArea && item.difficulty !== Difficulty.Bonuses && !item.isA("Shop");
    }

    filterExcludeInventory(inventory: Inventory, area: Area) {
        for (const [itemId] of inventory) {
            if (this.shouldRemove(itemId, area)) {
                inventory.delete(itemId);
            }
        }
        return inventory;
    }

    removeItems(area: Area) {
        // Remove placed items
        const placedItems = this.itemsService.getPlacedItems();
        const newPlacedItems = new Array<PlacedItem>();
        for (const placedItem of placedItems) {
            if (!this.shouldRemove(placedItem.item, area)) {
                newPlacedItems.push(placedItem);
            }
        }
        this.itemsService.setPlacedItems(newPlacedItems);

        // Remove bought history
        this.itemsService.setBought(this.filterExcludeInventory(this.itemsService.getBought(), area));

        // Remove items from inventory
        this.itemsService.setInventory(this.filterExcludeInventory(this.itemsService.getInventory(), area));
    }


    getSkillifyGain(power: InfiniteMath) {
        return InfiniteMath.log(power.div(trillion), 16).add(1);
    }

    onStart() {
        let debounce = 0;
        let skillificating = false;
        this.currencyService.balanceChanged.connect((balance) => {
            const power = balance.get("Power");
            if (power === undefined || power.lt(trillion)) {
                skillificating = false;
                this.skillificationMsg.Text = `You need ${trillion} W to reset`;
                this.skillificationMsg.Visible = true;
                this.skillificationGain.Text = "0 Skill";
            }
            else {
                skillificating = true;
                this.skillificationMsg.Visible = false;
                this.skillificationGain.Text = `${this.getSkillifyGain(power)} Skill`;
            }
        });
        this.skillificationPart.Touched.Connect((otherPart) => {
            if (skillificating === false || otherPart.Name !== "HumanoidRootPart" || tick() - debounce < 2.2)
                return;
            const character = otherPart.Parent;
            if (character === undefined)
                return;
            const player = Players.GetPlayerFromCharacter(character);
            if (player === undefined || !this.dataService.checkPermLevel(player, "reset")) {
                return;
            }
            debounce = tick();
            const currency = "Skill";
            const amount = this.getSkillifyGain(this.currencyService.getCost("Power"));
            ResetCanister.skillificating.fireAll(amount, currency);
            const players = Players.GetPlayers();
            for (const player of players) {
                if (player.Character !== undefined) {
                    player.Character.PivotTo(AREAS.SlamoVillage.spawnLocation!.CFrame);
                }
            }
            skillificating = false;
            this.reset.fire(player, "Skillification", amount, currency);

            task.delay(2, () => {
                this.gameAssetService.unplaceItems(player, 
                    this.itemsService.getPlacedItems().filter(value => value.area === "BarrenIslands").map(value => value.placementId ?? "default"));
                this.removeItems(AREAS.BarrenIslands);
                this.gameAssetService.fullUpdatePlacedItemsModels();
                this.currencyService.setCost("Funds", new InfiniteMath(0));
                this.currencyService.setCost("Power", new InfiniteMath(0));
                this.currencyService.setCost("Purifier Clicks", new InfiniteMath(0));
                this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.MoreFunds.id, 0);
                this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.MorePower.id, 0);
                this.upgradeBoardService.setUpgradeAmount(NamedUpgrade.LandReclaimation.id, 0);
                this.currencyService.incrementCost(currency, amount);
                for (const player of Players.GetPlayers()) {
                    pcall(() => BadgeService.AwardBadge(player.UserId, 1485187140296844));
                }
            });
        });
    }
}