import { OnoeNum } from "@antivivi/serikanum";
import { combineHumanReadable } from "@antivivi/vrldk";
import React from "@rbxts/react";
import { RobotoMono } from "client/ui/GameFonts";
import { AREAS } from "shared/world/Area";
import { getNameFromUserId } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

interface LogEntryProps {
    log: Log;
    layoutOrder: number;
}

/**
 * Formats log details based on the log type
 * Ported from LogController.createLogOption
 */
function formatLogDetails(log: Log): string {
    const itemName = log.item === undefined ? undefined : Items.getItem(log.item)?.name;

    switch (log.type) {
        case "Purchase": {
            if (log.items === undefined) {
                break;
            }
            const itemNames = combineHumanReadable(...log.items.map((id) => Items.getItem(id)?.name ?? ""));
            return `${getNameFromUserId(log.player)} bought ${itemNames}`;
        }
        case "Place":
            return `${getNameFromUserId(log.player)} placed ${itemName} at (${log.x}, ${log.y}, ${log.z})`;
        case "Unplace":
            return `${getNameFromUserId(log.player)} unplaced ${itemName} at (${log.x}, ${log.y}, ${log.z})`;
        case "Upgrade":
            return `${getNameFromUserId(log.player)} bought ${NamedUpgrades.ALL_UPGRADES.get(log.upgrade!)?.name} until ${log.amount}`;
        case "Respec":
            return `${getNameFromUserId(log.player)} respecialized level points`;
        case "Reset":
            return `${getNameFromUserId(log.player)} performed a ${log.layer} for ${log.currency === undefined || log.infAmount === undefined ? "nothing" : CurrencyBundle.getFormatted(log.currency, new OnoeNum(log.infAmount))}`;
        case "Bomb":
            return `${getNameFromUserId(log.player)} used 1 ${log.currency}`;
        case "SetupSave":
            return `${getNameFromUserId(log.player)} saved the setup in ${AREAS[log.area as AreaId]?.name}`;
        case "SetupLoad":
            return `${getNameFromUserId(log.player)} loaded the setup in ${AREAS[log.area as AreaId]?.name}`;
    }

    return "No details found.";
}

/**
 * Individual log entry component with timestamp and formatted details
 */
export default function LogEntry({ log, layoutOrder }: LogEntryProps) {
    const timestamp = os.date("%c", log.time);
    const details = formatLogDetails(log);

    return (
        <frame
            BackgroundColor3={Color3.fromRGB(20, 20, 20)}
            BorderSizePixel={0}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 0, 60)}
        >
            <uistroke Color={Color3.fromRGB(40, 40, 40)} Thickness={1} />
            <uicorner CornerRadius={new UDim(0, 6)} />

            {/* Timestamp */}
            <textlabel
                AnchorPoint={new Vector2(0, 0)}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Position={new UDim2(0, 10, 0, 5)}
                Size={new UDim2(1, -20, 0, 18)}
                Text={timestamp}
                TextColor3={Color3.fromRGB(150, 150, 150)}
                TextScaled={false}
                TextSize={12}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
            />

            {/* Details */}
            <textlabel
                AnchorPoint={new Vector2(0, 0)}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Position={new UDim2(0, 10, 0, 25)}
                Size={new UDim2(1, -20, 0, 30)}
                Text={details}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={false}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
            />
        </frame>
    );
}
