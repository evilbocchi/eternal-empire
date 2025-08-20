import { Players } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command("manager")
    .addAlias("man")
    .setDescription("<player> <useId: boolean> : Appoints a player as a manager, giving them a permission level of 2.")
    .setExecute((o, p, useId) => {
        const fp = (name: string, id: number) => name + " (ID: " + id + ")";
        const id = (p: string, useId: string) => {
            p = p.gsub("@", "")[0];
            return useId === "true" ? tonumber(p) : Players.GetUserIdFromNameAsync(p);
        };
        
        const userId = id(p, useId);
        if (userId !== undefined) {
            const success = CommandAPI.Permissions.add("managers", userId);
            if (success) {
                CommandAPI.ChatHook.sendPrivateMessage(o, `${fp(p, userId)} is now a manager`, "color:138,255,138");
            }
            else {
                CommandAPI.ChatHook.sendPrivateMessage(o, `${fp(p, userId)} is already a manager`, "color:255,43,43");
            }
            CommandAPI.Permissions.updatePermissionLevel(userId);
        }
    })
    .setPermissionLevel(3);