import Command from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("sset")
    .setDescription("<questId> <stage> : Set the stage number for the quest.")
    .setExecute((_o, questId, stage) => {
        const stagePerQuest = ThisEmpire.data.quests;
        if (stagePerQuest === undefined) {
            return;
        }

        if (stage) {
            stagePerQuest.set(questId, tonumber(stage) ?? 0);
        }
    })
    .setPermissionLevel(4);
