import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("sset")
    .setDescription("<questId> <stage> : Set the stage number for the quest.")
    .setExecute((_o, questId, stage) => {
        const stagePerQuest = CommandAPI.empireData.quests;
        if (stagePerQuest === undefined) {
            return;
        }
        stagePerQuest.set(questId, tonumber(stage) ?? 0);
        CommandAPI.Quest.setStagePerQuest(stagePerQuest);
        CommandAPI.Quest.loadAvailableQuests();
    })
    .setPermissionLevel(4);