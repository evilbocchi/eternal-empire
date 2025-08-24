import Command, { CommandAPI } from "server/services/permissions/commands/Command";

export = new Command(script.Name)
    .addAlias("rq")
    .setDescription("Reload all quests.")
    .setExecute((_o) => {
        CommandAPI.Quest.loadQuests();
    })
    .setPermissionLevel(4);