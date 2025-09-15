import { BaseOnoeNum } from "@antivivi/serikanum";
import { OnInit, OnStart, Service } from "@flamework/core";
import { setInterval } from "@rbxts/jsnatives";
import DataService from "server/services/data/DataService";
import LevelService from "server/services/data/LevelService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import SetupService from "server/services/data/SetupService";
import ChatHookService from "server/services/permissions/ChatHookService";
import ResetService from "server/services/ResetService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Packets from "shared/Packets";
import { RESET_LAYERS } from "shared/ResetLayer";

declare global {
    interface Log {
        /**
         * Timestamp of the log entry.
         */
        time: number;

        /**
         * Type of the log entry.
         */
        type: string;

        /**
         * ID of the player associated with the log entry.
         */
        player?: number;

        /**
         * ID of the player who performed the action.
         */
        actor?: number;

        /**
         * ID of the player who received the action.
         */
        recipient?: number;

        /**
         * X coordinates of the action.
         */
        x?: number;

        /**
         * Y coordinates of the action.
         */
        y?: number;

        /**
         * Z coordinates of the action.
         */
        z?: number;

        /**
         * Area of the action.
         */
        area?: string;

        /**
         * Upgrade related to the action.
         */
        upgrade?: string;

        /**
         * Item related to the action.
         */
        item?: string;

        /**
         * List of items related to the action.
         */
        items?: string[];

        /**
         * Layer related to the action.
         */
        layer?: string;

        /**
         * Amount related to the action.
         *
         * @see {@link infAmount} for bigger numbers.
         */
        amount?: number;

        /**
         * Amount related to the action.
         *
         * @see {@link amount} for smaller numbers.
         */
        infAmount?: BaseOnoeNum;

        /**
         * Currency related to the action.
         */
        currency?: Currency;
    }
}

const PENDING = new Array<Log>();

/**
 * Function to log actions within the game.
 * This function is assigned in the LogService constructor.
 * @param log The log entry to be recorded.
 */
export let log = (log: Log) => {
    PENDING.push(log);
};

@Service()
export default class LogService implements OnInit, OnStart {
    unpropagatedLogs = new Array<Log>();

    constructor(
        private dataService: DataService,
        private namedUpgradeService: NamedUpgradeService,
        private levelService: LevelService,
        private resetService: ResetService,
        private setupService: SetupService,
        private chatHookService: ChatHookService,
    ) {}

    onInit() {
        Packets.getLogs.fromClient(() => this.dataService.empireData.logs);

        log = (log: Log) => {
            const data = this.dataService.empireData;
            data.logs = data.logs.filter((value) => tick() - value.time < 604800);
            data.logs.push(log);
            this.unpropagatedLogs.push(log);
        };
        for (const logEntry of PENDING) {
            log(logEntry);
        }
    }

    onStart() {
        setInterval(() => {
            if (this.unpropagatedLogs.size() === 0) return;
            Packets.logsAdded.toAllClients(this.unpropagatedLogs);
            this.unpropagatedLogs.clear();
        }, 1000);

        this.namedUpgradeService.upgradeBought.connect((player, upgrade, to) =>
            log({
                time: tick(),
                type: "Upgrade",
                player: player.UserId,
                upgrade: upgrade,
                amount: to,
            }),
        );
        this.levelService.respected.connect((player) =>
            log({
                time: tick(),
                type: "Respec",
                player: player.UserId,
            }),
        );
        this.resetService.reset.connect((player, layer, amount) => {
            const resetLayer = RESET_LAYERS[layer];
            const color = CURRENCY_DETAILS[resetLayer.gives].color;
            this.chatHookService.sendServerMessage(
                `${player.Name} performed a ${layer} for ${CurrencyBundle.getFormatted(resetLayer.gives, amount)}`,
                `color:${color.R * 255},${color.G * 255},${color.B * 255}`,
            );
            log({
                time: tick(),
                type: "Reset",
                layer: layer,
                player: player.UserId,
                infAmount: amount,
                currency: resetLayer.gives,
            });
        });
        this.setupService.setupSaved.connect((player, area) =>
            log({
                time: tick(),
                type: "SetupSave",
                player: player.UserId,
                area: area,
            }),
        );
        this.setupService.setupLoaded.connect((player, area) =>
            log({
                time: tick(),
                type: "SetupLoad",
                player: player.UserId,
                area: area,
            }),
        );
    }
}
