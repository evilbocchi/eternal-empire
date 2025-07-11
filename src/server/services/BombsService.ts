import { OnStart, Service } from "@flamework/core";
import { DataStoreService, MessagingService, Workspace } from "@rbxts/services";
import { Fletchette, RemoteFunc, Signal } from "@antivivi/fletchette";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";
import Price from "shared/Price";

declare global {
    interface FletchetteCanisters {
        BombsCanister: typeof BombsCanister;
    }
}

type BombMessage = {
    bombType: Currency,
    player: number,
    endTime: number
}

const BombsCanister = Fletchette.createCanister("BombsCanister", {
    useBomb: new RemoteFunc<(bombType: Currency) => boolean>(),
});


@Service()
export class BombsService implements OnStart {

    globalDataStore = DataStoreService.GetGlobalDataStore();
    bombUsed = new Signal<(player: Player, bombType: Currency) => void>();
    bombActive = new Signal<(endTime: number, bombType: Currency, player: number) => void>();
    fundsBombEnabled = false;
    fundsBombBoost = new Price().setCost("Funds", 1.2);

    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    refreshBombsEnabled() {
        const currentTime = os.time();
        const fundsBombTime = Workspace.GetAttribute("FundsBombTime") as number | undefined;
        this.fundsBombEnabled = fundsBombTime !== undefined && fundsBombTime > currentTime;
    }

    onStart() {
        Workspace.SetAttribute("FundsBombTime", this.globalDataStore.GetAsync("Funds")[0] as number | undefined);
        task.spawn(() => {
            while (task.wait(1)) {
                this.refreshBombsEnabled();
            }
        });

        this.refreshBombsEnabled();
    
        MessagingService.SubscribeAsync("Bomb", (message) => {
            const data = message.Data as BombMessage;
            if (data.bombType === "Funds Bombs") {
                Workspace.SetAttribute("FundsBombTime", data.endTime);
                this.bombActive.fire(data.endTime, data.bombType, data.player);
                this.refreshBombsEnabled();
            }
        });

        BombsCanister.useBomb.onInvoke((player, bombType) => {
            if (!this.dataService.checkPermLevel(player, "purchase")) {
                return false;
            }
            const amount = this.currencyService.getCost(bombType);
            if (amount.lessEquals(0)) {
                return false;
            }
            if (bombType === "Funds Bombs") {
                this.bombUsed.fire(player, bombType);
                this.globalDataStore.UpdateAsync("Funds", (oldValue: number | undefined) => {
                    const currentTime = os.time();
                    let value: number;
                    if (oldValue === undefined || oldValue < currentTime) {
                        value = currentTime + (15 * 60);
                    }
                    else {
                        value = oldValue + (15 * 60);
                    }
                    task.spawn(() => {
                        MessagingService.PublishAsync("Bomb", {
                            bombType: bombType,
                            player: player.UserId,
                            endTime: value
                        });
                    });
                    return $tuple(value);
                });
                this.currencyService.setCost(bombType, amount.sub(1));
                return true;
            }
            return false;
        });
    }
}