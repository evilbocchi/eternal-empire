import { Controller, OnStart } from "@flamework/core";
import { LOGS_WINDOW } from "client/constants";
import Price from "shared/Price";
import { AREAS, Log, UI_ASSETS, getNameFromUserId } from "shared/constants";
import NamedUpgrade from "shared/item/NamedUpgrade";
import Items from "shared/items/Items";
import { Fletchette } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { combineHumanReadable } from "shared/utils/vrldk/StringUtils";

const PermissionsCanister = Fletchette.getCanister("PermissionsCanister");

@Controller()
export class LogController implements OnStart {

    i = 1000000;

    addLog(log: Log) {
        const logOption = UI_ASSETS.LogOption.Clone();
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
                details = `${getNameFromUserId(log.player)} bought ${NamedUpgrade.getUpgrade(log.upgrade!)?.name} until ${log.amount}`;
                break;
            case "Respec":
                details = `${getNameFromUserId(log.player)} respecialized level points`;
                break;
            case "Reset":
                details = `${getNameFromUserId(log.player)} performed a ${log.layer} for ${log.currency === undefined || log.infAmount === undefined ? "nothing" : Price.getFormatted(log.currency, new InfiniteMath(log.infAmount))}`;
                break;
            case "Bomb":
                details = `${getNameFromUserId(log.player)} used 1 ${log.currency}`;
                break;
            case "SetupSave":
                details = `${getNameFromUserId(log.player)} saved the setup in ${AREAS[log.area as keyof (typeof AREAS)].name}`;
                break;
            case "SetupLoad":
                details = `${getNameFromUserId(log.player)} loaded the setup in ${AREAS[log.area as keyof (typeof AREAS)].name}`;
                break;
        }
        logOption.DetailsLabel.Text = details;
        logOption.LayoutOrder = this.i;
        logOption.Parent = LOGS_WINDOW.LogList;
        --this.i;
    }

    onStart() {
        const logs = PermissionsCanister.getLogs.invoke();
        for (const log of logs) {
            this.addLog(log);
        }
        PermissionsCanister.logAdded.connect((log) => this.addLog(log));
    }
}