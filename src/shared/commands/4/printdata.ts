import Command from "shared/commands/Command";
import ThisEmpire from "shared/data/ThisEmpire";

export = new Command(script.Name)
    .addAlias("pd")
    .setDescription("Print game data to console.")
    .setExecute((_o) => print(ThisEmpire.data))
    .setPermissionLevel(4);
