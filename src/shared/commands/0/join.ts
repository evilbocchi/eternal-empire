import { TeleportService } from "@rbxts/services";
import Command from "shared/commands/Command";
import { IS_SINGLE_SERVER } from "shared/Context";

export = new Command(script.Name)
    .addAlias("j")
    .setDescription("<accesscode> : Joins an empire given an access code.")
    .setExecute((o, accessCode) => {
        if (IS_SINGLE_SERVER) {
            return;
        }
        const [ac, id] = accessCode.split("|");
        TeleportService.TeleportToPrivateServer(game.PlaceId, ac, [o], undefined, id);
    })
    .setPermissionLevel(0);
