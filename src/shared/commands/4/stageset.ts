import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("sset")
    .setDescription("<questId> <stage> : Set the stage number for the quest.")
    .setExecute((_o, questId, stage) => {
        const stagePerQuest = CommandAPI.empireData.quests;
        if (stagePerQuest === undefined) {
            return;
        }

        if (stage) {
            stagePerQuest.set(questId, tonumber(stage) ?? 0);
        }
    })
    .setPermissionLevel(4);
