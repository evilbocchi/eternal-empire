import Command, { CommandAPI } from "shared/commands/Command";
import { Server } from "shared/item/ItemUtils";

export = new Command(script.Name)
    .addAlias("sset")
    .setDescription(
        "<questId> <stage> : Set the stage number for the quest. Do not specify any parameters for a simple hot reload.",
    )
    .setExecute((_o, questId, stage) => {
        const stagePerQuest = CommandAPI.empireData.quests;
        if (stagePerQuest === undefined) {
            return;
        }

        if (stage) {
            stagePerQuest.set(questId, tonumber(stage) ?? 0);
        }

        Server.Hamster.reload();
    })
    .setPermissionLevel(4);
