import Quest from "server/Quest";
import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("cq")
    .setDescription("<questId> : Complete a quest.")
    .setExecute((_o, questId) => {
        const quest = Quest.getQuest(questId);
        if (quest === undefined) {
            return;
        }
        CommandAPI.Quest.completeQuest(quest);
    })
    .setPermissionLevel(4);