import Quest from "server/Quest";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("cq")
    .setDescription("<questId> : Complete a quest.")
    .setExecute((_o, questId) => {
        const quest = Quest.QUEST_PER_ID.get(questId);
        if (quest === undefined) {
            CommandAPI.ChatHook.sendPrivateMessage(_o, `Quest with ID '${questId}' not found.`);
            return;
        }
        CommandAPI.Quest.completeQuest(quest);
    })
    .setPermissionLevel(4);