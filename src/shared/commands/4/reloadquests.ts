import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("rq")
    .setDescription("Reload all quests.")
    .setExecute((_o) => {
        CommandAPI.Quest.loadQuests();
    })
    .setPermissionLevel(4);
