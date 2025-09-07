import { ReplicatedStorage } from "@rbxts/services";
import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("csset")
    .setDescription("<id> : Set the color for color strict items.")
    .setExecute((_o, colorId) => {
        ReplicatedStorage.SetAttribute("ColorStrictColor", tonumber(colorId) ?? 0);
        CommandAPI.ChatHook.sendServerMessage(`Color strict color set to ${tonumber(colorId) ?? 0}.`);
    })
    .setPermissionLevel(4);
