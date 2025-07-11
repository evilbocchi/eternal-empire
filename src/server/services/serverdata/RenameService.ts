import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import { MarketplaceService, TextService, Workspace } from "@rbxts/services";
import { GameAssetService } from "server/services/GameAssetService";
import { LeaderboardService } from "server/services/LeaderboardService";
import { PermissionsService } from "server/services/PermissionsService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { getNameFromUserId, getSound } from "shared/constants";
import Packets from "shared/network/Packets";
import Price from "shared/Price";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";

@Service()
export class RenameService implements OnInit {
    
    readonly PRODUCT_ID = 1941029484;
    cost = this.refreshCost();
    namesPerPlayer = new Map<Player, string>();

    constructor(private dataService: DataService, private gameAssetService: GameAssetService, 
        private leaderboardService: LeaderboardService, private currencyService: CurrencyService, private permissionsService: PermissionsService) {

    }

    refreshCost() {
        const cost = new OnoeNum(1e24).mul(new OnoeNum(1000).pow(this.dataService.empireData.nameChanges));
        Packets.renameCost.set(cost);
        this.cost = cost;
        return cost;
    }

    rename(name: string, player: Player) {
        if (name === this.dataService.empireData.name) {
            this.permissionsService.sendPrivateMessage(player, "Rename is same as current name. Please change it.");
            return false;
        }
        const filtered = TextService.FilterStringAsync(name, player.UserId).GetNonChatStringForBroadcastAsync();
        if (filtered !== name) {
            this.permissionsService.sendPrivateMessage(player, "Rename is filtered. Output: " + filtered);
            return false;
        }
        if (this.leaderboardService.totalTimeStore.GetAsync(name) !== undefined) {
            this.permissionsService.sendPrivateMessage(player, "This name is already in use.");
            return false;
        }
        
        name = getNameFromUserId(this.dataService.empireData.owner) + "'s " + name;
        playSoundAtPart(Workspace, getSound("SpellCardAttack"));
        Packets.camShake.fireAll();
        this.permissionsService.sendServerMessage("The empire has been renamed to: " + name);

        const prev = this.dataService.empireData.name;
        this.dataService.empireData.name = name;
        task.spawn(() => this.leaderboardService.updateLeaderboards(prev));
        Packets.empireName.set(name);
        this.dataService.empireData.previousNames.add(prev);
        this.dataService.empireData.previousNames.delete(name);
        return true;
    }

    onInit() {
        Packets.empireName.set(this.dataService.empireData.name);
        Packets.promptRename.onInvoke((player, name, method) => {
            if (this.dataService.checkPermLevel(player, "purchase") === false) {
                return false;
            }
            [name] = name.gsub('[^%w_ ]', '');
            const size = name.size();
            if (size > 16 || size < 5)
                return false;

            if (method === "robux") {
                this.namesPerPlayer.set(player, name);
                MarketplaceService.PromptProductPurchase(player, this.PRODUCT_ID);
            }
            else {
                const [isAffordable, remaining] = this.currencyService.isSufficientBalance(new Price().setCost("Funds", this.cost));
                if (isAffordable === false)
                    return false;
               
                const success = this.rename(name, player);
                if (success === true) {
                    ++this.dataService.empireData.nameChanges;
                    this.refreshCost();
                    this.currencyService.setBalance(remaining);

                }
                return success;
            }
            return true;
        });
        
        this.gameAssetService.setProductFunction(this.PRODUCT_ID, (_receiptInfo, player) => {
            const name = this.namesPerPlayer.get(player);
            if (name === undefined)
                return Enum.ProductPurchaseDecision.NotProcessedYet;

            this.rename(name, player);
            return Enum.ProductPurchaseDecision.PurchaseGranted;
        });
    }
}