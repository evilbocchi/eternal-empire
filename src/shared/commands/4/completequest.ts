import { Server } from "shared/api/APIExpose";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("cq")
    .setDescription("<questId> : Complete a quest.")
    .setExecute((_o, questId) => {
        const quest = Server.Quest.Quest.REGISTRY.OBJECTS.get(questId);
        if (quest === undefined) {
            Server.ChatHook.sendPrivateMessage(_o, `Quest with ID '${questId}' not found.`);
            return;
        }
        quest.completed = false; // Reset quest completion status
        quest.complete();
        Server.Quest.Quest.reachStages();
        Server.ChatHook.sendPrivateMessage(_o, `Quest '${questId}' marked as complete.`);
    })
    .setPermissionLevel(4);
