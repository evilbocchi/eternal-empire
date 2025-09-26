import setPermLevel from "shared/commands/3/setPermLevel";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("rl")
    .setDescription("<permlevel> : Sets the minimum permission level required to reset.")
    .setExecute((sender, level) => {
        setPermLevel(sender, "reset", level);
    })
    .setPermissionLevel(3);
