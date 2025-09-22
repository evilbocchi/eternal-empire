import Command, { CommandAPI } from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";
import Packets from "shared/Packets";

export = new Command(script.Name)
    .addAlias("bl")
    .setDescription("<permlevel> : Sets the minimum permission level required to build.")
    .setExecute((o, level) => {
        const setPermLevel = (o: Player, perm: keyof typeof ThisEmpire.data.permLevels, level: string) => {
            const lvl = tonumber(level);
            if (lvl === undefined) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `${level} is not a valid permission level`,
                    "color:255,43,43",
                );
                return;
            } else if (lvl > CommandAPI.Permissions.getPermissionLevel(o.UserId)) {
                CommandAPI.ChatHook.sendPrivateMessage(
                    o,
                    `You cannot set a permission level higher than your own`,
                    "color:255,43,43",
                );
                return;
            }
            ThisEmpire.data.permLevels[perm] = math.min(3, lvl);
            Packets.permLevels.set(ThisEmpire.data.permLevels);
            CommandAPI.ChatHook.sendServerMessage(
                `Permission level ${lvl} set for permission ${perm}`,
                "color:138,255,138",
            );
        };

        setPermLevel(o, "build", level);
    })
    .setPermissionLevel(3);
