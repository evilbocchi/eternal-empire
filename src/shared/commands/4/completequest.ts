import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("cq")
    .setDescription("<questId> : Complete a quest.")
    .setExecute((_o, questId) => {
        const quest = CommandAPI.Quest.Quest.QUEST_PER_ID.get(questId);
        if (quest === undefined) {
            CommandAPI.ChatHook.sendPrivateMessage(_o, `Quest with ID '${questId}' not found.`);
            return;
        }
        quest.completed = false; // Reset quest completion status
        quest.complete();
        CommandAPI.Quest.reachStages();
        CommandAPI.ChatHook.sendPrivateMessage(_o, `Quest '${questId}' marked as complete.`);
    })
    .setPermissionLevel(4);
