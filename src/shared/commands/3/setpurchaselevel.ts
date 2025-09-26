import setPermLevel from "shared/commands/3/setPermLevel";
import Command from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("pl")
    .setDescription("<permlevel> : Sets the minimum permission level required to purchase items.")
    .setExecute((sender, level) => {
        setPermLevel(sender, "purchase", level);
    })
    .setPermissionLevel(3);
