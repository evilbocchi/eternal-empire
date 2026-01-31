import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("lset")
    .setDescription("<amount> : Set the empire's level.")
    .setExecute((_o, amount) => {
        const a = tonumber(amount) ?? 0;
        Server.Level.setLevel(a);
    })
    .setPermissionLevel(4);
