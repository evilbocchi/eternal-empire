import { Lighting } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("timeofday")
    .addAlias("time")
    .setDescription("<hours> : Set the hours after midnight")
    .setExecute((_o, hours) => {
        Lighting.ClockTime = tonumber(hours) ?? 0;
    })
    .setPermissionLevel(4);