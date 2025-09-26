import { CommandAPI } from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";
import Packets from "shared/Packets";

export default function setPermLevel(
    sender: Player | undefined,
    perm: keyof typeof ThisEmpire.data.permLevels,
    level: string,
) {
    const lvl = tonumber(level);
    if (lvl === undefined) {
        CommandAPI.ChatHook.sendPrivateMessage(sender, `${level} is not a valid permission level`, "color:255,43,43");
        return;
    } else if (sender !== undefined && lvl > CommandAPI.Permissions.getPermissionLevel(sender.UserId)) {
        CommandAPI.ChatHook.sendPrivateMessage(
            sender,
            `You cannot set a permission level higher than your own`,
            "color:255,43,43",
        );
        return;
    }
    ThisEmpire.data.permLevels[perm] = math.min(3, lvl);
    Packets.permLevels.set(ThisEmpire.data.permLevels);
    CommandAPI.ChatHook.sendServerMessage(`Permission level ${lvl} set for permission ${perm}`, "color:138,255,138");
}
