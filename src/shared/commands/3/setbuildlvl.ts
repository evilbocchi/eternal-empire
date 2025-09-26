import setPermLevel from "shared/commands/3/setPermLevel";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("bl")
    .setDescription("<permlevel> : Sets the minimum permission level required to build.")
    .setExecute((sender, level) => {
        setPermLevel(sender, "build", level);
    })
    .setPermissionLevel(3);
