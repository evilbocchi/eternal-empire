import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("xset")
    .setDescription("<amount> : Set the empire's XP.")
    .setExecute((_o, amount) => {
        const a = tonumber(amount) ?? 0;
        Server.Level.setXp(a);
    })
    .setPermissionLevel(4);
