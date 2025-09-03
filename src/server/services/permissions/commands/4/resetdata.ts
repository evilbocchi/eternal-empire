import { Workspace } from "@rbxts/services";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("wipedata")
    .setDescription("Reset all data like no progress was ever made.")
    .setExecute(() => {
        const attempts = ((Workspace.GetAttribute("ResetAttempts") as number | undefined) ?? 0) + 1;
        Workspace.SetAttribute("ResetAttempts", attempts);
        if (attempts === 1)
            CommandAPI.ChatHook.sendServerMessage(
                "Are you sure you want to reset your data? Type /resetdata again to confirm.",
            );
        else if (attempts === 2)
            CommandAPI.ChatHook.sendServerMessage(
                "Yeah, but are you REALLY sure? Like, REALLY REALLY sure? You can't recover this data once it's gone.",
            );
        else if (attempts === 3)
            CommandAPI.ChatHook.sendServerMessage(
                "I'm saying that you gain nothing in return for doing this. Literally nothing.",
            );
        else if (attempts === 4) CommandAPI.ChatHook.sendServerMessage("...");
        else if (attempts === 5) CommandAPI.ChatHook.sendServerMessage(".....");
        else if (attempts === 6)
            CommandAPI.ChatHook.sendServerMessage("If you say so. Type /resetdata 3 more times to confirm.");
        else if (attempts === 7) CommandAPI.ChatHook.sendServerMessage("Type /resetdata 2 more times to confirm.");
        else if (attempts === 8) CommandAPI.ChatHook.sendServerMessage("Type /resetdata 1 more time to confirm.");
        else if (attempts === 9) {
            CommandAPI.ChatHook.sendServerMessage("You have confirmed the data reset.");
            task.delay(2, () => CommandAPI.ChatHook.sendServerMessage("This world will cease to exist in 5 seconds."));
            task.delay(4, () => CommandAPI.ChatHook.sendServerMessage("Goodbye"));
            task.delay(7, () => {
                const players = CommandAPI.Command.findPlayers(undefined as unknown as Player, "all");
                for (const player of players) player.Kick("This world has collapsed.");
            });
        }
    })
    .setPermissionLevel(4);
