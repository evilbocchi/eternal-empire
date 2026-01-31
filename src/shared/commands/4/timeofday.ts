import { Lighting } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("time")
    .setDescription("<hours> : Set the hours after midnight")
    .setExecute((_o, hours) => {
        Lighting.ClockTime = tonumber(hours) ?? 0;
    })
    .setPermissionLevel(4);
