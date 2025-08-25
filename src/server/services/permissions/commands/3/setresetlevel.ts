import Command, { CommandAPI } from "server/services/permissions/commands/Command";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("rl")
    .setDescription("<permlevel> : Sets the minimum permission level required to reset.")
    .setExecute((o, level) => {
        const setPermLevel = (o: Player, perm: keyof (typeof CommandAPI.Data.empireData.permLevels), level: string) => {
            const lvl = tonumber(level);
            if (lvl === undefined) {
                CommandAPI.ChatHook.sendPrivateMessage(o, `${level} is not a valid permission level`, "color:255,43,43");
                return;
            }
            else if (lvl > CommandAPI.Permissions.getPermissionLevel(o.UserId)) {
                CommandAPI.ChatHook.sendPrivateMessage(o, `You cannot set a permission level higher than your own`, "color:255,43,43");
                return;
            }
            CommandAPI.Data.empireData.permLevels[perm] = math.min(3, lvl);
            Packets.permLevels.set(CommandAPI.Data.empireData.permLevels);
            CommandAPI.ChatHook.sendServerMessage(`Permission level ${lvl} set for permission ${perm}`, "color:138,255,138");
        };

        setPermLevel(o, "reset", level);
    })
    .setPermissionLevel(3);