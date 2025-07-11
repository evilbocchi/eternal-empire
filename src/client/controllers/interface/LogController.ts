import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { LOGS_WINDOW } from "client/constants";
import { BalanceWindowController } from "client/controllers/interface/BalanceWindowController";
import Price from "shared/Price";
import { AREAS, ASSETS, getNameFromUserId } from "shared/constants";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/network/Packets";
import { combineHumanReadable } from "shared/utils/vrldk/StringUtils";

@Controller()
export class LogController implements OnInit, OnStart {

    logsLength = 0;
    logs = new Array<Log>();
    page = 1;
    i = 0;

    constructor(private balanceWindowController: BalanceWindowController) {

    }

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
                details = `${getNameFromUserId(log.player)} performed a ${log.layer} for ${log.currency === undefined || log.infAmount === undefined ? "nothing" : Price.getFormatted(log.currency, new OnoeNum(log.infAmount))}`;
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

    onStart() {
        this.logs = Packets.getLogs.invoke();
        this.logsLength = this.logs.size();
        Packets.logAdded.connect((log) => {
            this.logs.push(log);
            this.logsLength = this.logs.size();
            this.refreshLogsWindow();
        });
        this.refreshLogsWindow();
    }
}