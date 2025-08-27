/**
 * @fileoverview Client controller for managing the logs window and displaying player and game logs.
 *
 * Handles:
 * - Creating and displaying log entries for various game events
 * - Paginating logs and updating the logs window
 * - Integrating with BalanceWindowController for navigation
 * - Listening for new log events and updating the UI
 *
 * The controller manages log data, UI creation, and navigation for the logs window, providing a history of important player and game actions.
 *
 * @since 1.0.0
 */
import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/core/AdaptiveTabController";
import BalanceWindowController from "client/controllers/interface/BalanceWindowController";
import { getNameFromUserId } from "shared/constants";
import { ASSETS } from "shared/asset/GameAssets";
import { AREAS } from "shared/Area";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { combineHumanReadable } from "@antivivi/vrldk";

declare global {
    interface Assets {
        LogOption: Frame & {
            DetailsLabel: TextLabel,
            TimestampLabel: TextLabel;
        };
    }
}

export const LOGS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Logs") as Frame & {
    LogList: Frame,
    NavigationOptions: Frame & {
        Left: NavigationOption,
        Right: NavigationOption,
        PageLabel: TextLabel;
    };
};

/**
 * Controller responsible for managing the logs window, log entry creation, and log pagination.
 *
 * Handles log UI creation, navigation, and updates in response to new log events.
 */
@Controller()
export default class LogController implements OnInit, OnStart {

    logsLength = 0;
    logs = new Array<Log>();
    page = 1;
    i = 0;

    constructor(private balanceWindowController: BalanceWindowController) {

    }

    /**
     * Creates a log option UI element for a given log entry.
     * @param log The log entry to display.
     * @returns The created log option UI element.
     */
    createLogOption(log: Log) {
        const logOption = ASSETS.LogOption.Clone();
        logOption.TimestampLabel.Text = os.date("%c", log.time);
        let details = "No details found.";
        const itemName = log.item === undefined ? undefined : Items.getItem(log.item)?.name;
        switch (log.type) {
            case "Purchase": {
                if (log.items === undefined) {
                    break;
                }
                const itemNames = combineHumanReadable(...log.items.map((id) => Items.getItem(id)?.name ?? ""));
                details = `${getNameFromUserId(log.player)} bought ${itemNames}`;
                break;
            }
            case "Place":
                details = `${getNameFromUserId(log.player)} placed ${itemName} at (${log.x}, ${log.y}, ${log.z})`;
                break;
            case "Unplace":
                details = `${getNameFromUserId(log.player)} unplaced ${itemName} at (${log.x}, ${log.y}, ${log.z})`;
                break;
            case "Upgrade":
                details = `${getNameFromUserId(log.player)} bought ${NamedUpgrades.ALL_UPGRADES.get(log.upgrade!)?.name} until ${log.amount}`;
                break;
            case "Respec":
                details = `${getNameFromUserId(log.player)} respecialized level points`;
                break;
            case "Reset":
                details = `${getNameFromUserId(log.player)} performed a ${log.layer} for ${log.currency === undefined || log.infAmount === undefined ? "nothing" : CurrencyBundle.getFormatted(log.currency, new OnoeNum(log.infAmount))}`;
                break;
            case "Bomb":
                details = `${getNameFromUserId(log.player)} used 1 ${log.currency}`;
                break;
            case "SetupSave":
                details = `${getNameFromUserId(log.player)} saved the setup in ${AREAS[log.area as AreaId].name}`;
                break;
            case "SetupLoad":
                details = `${getNameFromUserId(log.player)} loaded the setup in ${AREAS[log.area as AreaId].name}`;
                break;
        }
        logOption.DetailsLabel.Text = details;
        logOption.LayoutOrder = this.i;
        --this.i;
        return logOption;
    }

    /**
     * Refreshes the logs window, updating visible log entries and pagination.
     */
    refreshLogsWindow() {
        LOGS_WINDOW.NavigationOptions.PageLabel.Text = `Page ${this.page}`;
        const start = this.logsLength - (this.page * 20);
        const logOptions = LOGS_WINDOW.LogList.GetChildren();
        for (const logOption of logOptions) {
            const index = tonumber(logOption.Name);
            if (index === undefined)
                continue;
            if (index >= start && index < start + 20)
                continue;
            logOption.Destroy();
        }
        for (let i = start; i < start + 20; i++) {
            const log = this.logs[i];
            if (log === undefined)
                continue;
            const cachedLogOption = LOGS_WINDOW.LogList.FindFirstChild(i);
            if (cachedLogOption !== undefined)
                continue;
            const logOption = this.createLogOption(log);
            logOption.Name = tostring(i);
            logOption.Parent = LOGS_WINDOW.LogList;
        }
    }

    /**
     * Initializes the LogController, sets up navigation options for log pagination.
     */
    onInit() {
        this.balanceWindowController.loadNavigationOption(LOGS_WINDOW.NavigationOptions.Left, Enum.KeyCode.Z, "Previous Page", () => {
            if (LOGS_WINDOW.Visible === false)
                return false;
            --this.page;
            if (this.page < 1) {
                this.page = 1;
            }
            this.refreshLogsWindow();
            return true;
        }, 5);
        this.balanceWindowController.loadNavigationOption(LOGS_WINDOW.NavigationOptions.Right, Enum.KeyCode.C, "Next Page", () => {
            if (LOGS_WINDOW.Visible === false)
                return false;
            ++this.page;
            this.refreshLogsWindow();
            return true;
        }, 5);
    }

    /**
     * Starts the LogController, loads logs and listens for new log events.
     */
    onStart() {
        this.logs = Packets.getLogs.toServer();
        this.logsLength = this.logs.size();
        Packets.logAdded.fromServer((log) => {
            this.logs.push(log);
            this.logsLength = this.logs.size();
            this.refreshLogsWindow();
        });
        this.refreshLogsWindow();
    }
}