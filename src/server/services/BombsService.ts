//!native
//!optimize 2

import Signal from "@antivivi/lemon-signal";
import { OnInit, OnStart, Service } from "@flamework/core";
import { DataStoreService, MessagingService, Workspace } from "@rbxts/services";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";

type BombMessage = {
    bombType: Currency,
    player: number,
    endTime: number;
};

@Service()
export class BombsService implements OnInit, OnStart {

    globalDataStore = DataStoreService.GetGlobalDataStore();
    bombUsed = new Signal<(player: Player, bombType: Currency) => void>();
    bombActive = new Signal<(endTime: number, bombType: Currency, player: number) => void>();
    fundsBombEnabled = false;
    fundsBombBoost = new CurrencyBundle().set("Funds", 2);
    debounce = 0;

    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    refreshBombsEnabled() {
        const currentTime = os.time();
        const fundsBombTime = Workspace.GetAttribute("FundsBombTime") as number | undefined;
        this.fundsBombEnabled = fundsBombTime !== undefined && fundsBombTime > currentTime;
    }

    onInit() {
        Packets.useBomb.onInvoke((player, bombType) => {
            if (!this.dataService.checkPermLevel(player, "purchase")) {
                return false;
            }

            if (this.currencyService.get(bombType).lessEquals(0) || tick() - this.debounce < 1) {
                return false;
            }

            this.debounce = tick();
            if (bombType === "Funds Bombs") {
                this.bombUsed.fire(player, bombType);
                this.globalDataStore.UpdateAsync("Funds", (oldValue: number | undefined) => {
                    let base = os.time();
                    let value: number;

                    const amount = this.currencyService.get(bombType);
                    if (amount.lessEquals(0)) {
                        value = base;
                    }
                    else {
                        if (oldValue !== undefined && oldValue > base)
                            base = oldValue;

                        value = base + (15 * 60);
                        const msg = {
                            bombType: bombType,
                            player: player.UserId,
                            endTime: value
                        };
                        this.updateBomb(msg);
                        task.spawn(() => {
                            MessagingService.PublishAsync("Bomb", msg);
                        });
                        this.currencyService.set(bombType, amount.sub(1));
                    }


                    return $tuple(value);
                });
                return true;
            }
            return false;
        });
    }

    updateBomb(data: BombMessage) {
        if (data.bombType === "Funds Bombs") {
            Workspace.SetAttribute("FundsBombTime", data.endTime);
            this.bombActive.fire(data.endTime, data.bombType, data.player);
            this.refreshBombsEnabled();
        }
    }
    onStart() {
        Workspace.SetAttribute("FundsBombTime", this.globalDataStore.GetAsync("Funds")[0] as number | undefined);
        task.spawn(() => {
            while (task.wait(1)) {
                this.refreshBombsEnabled();
            }
        });

        this.refreshBombsEnabled();

        MessagingService.SubscribeAsync("Bomb", (message) => this.updateBomb(message.Data as BombMessage));
    }
}