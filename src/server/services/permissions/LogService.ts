import { BaseOnoeNum } from "@antivivi/serikanum";
import { OnInit, OnStart, Service } from "@flamework/core";
import DataService from "server/services/data/DataService";
import Packets from "shared/Packets";

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
    readonly unpropagatedLogs = new Array<Log>();

    constructor(private dataService: DataService) {}

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
        task.spawn(() => {
            while (task.wait(1)) {
                if (this.unpropagatedLogs.size() === 0) return;
                Packets.logsAdded.toAllClients(this.unpropagatedLogs);
                this.unpropagatedLogs.clear();
            }
        });
    }
}
