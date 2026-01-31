import { Server } from "shared/api/APIExpose";
import Packets from "shared/Packets";

export default function setPermLevel(
    sender: Player | undefined,
    perm: keyof typeof Server.empireData.permLevels,
    level: string,
) {
    const lvl = tonumber(level);
    if (lvl === undefined) {
        Server.ChatHook.sendPrivateMessage(sender, `${level} is not a valid permission level`, "color:255,43,43");
        return;
    } else if (sender !== undefined && lvl > Server.Permissions.getPermissionLevel(sender.UserId)) {
        Server.ChatHook.sendPrivateMessage(
            sender,
            `You cannot set a permission level higher than your own`,
            "color:255,43,43",
        );
        return;
    }
    Server.empireData.permLevels[perm] = math.min(3, lvl);
    Packets.permLevels.set(Server.empireData.permLevels);
    Server.ChatHook.sendServerMessage(`Permission level ${lvl} set for permission ${perm}`, "color:138,255,138");
}
