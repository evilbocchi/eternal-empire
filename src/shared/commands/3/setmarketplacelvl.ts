import Command from "shared/commands/Command";
import setPermLevel from "shared/commands/setPermLevel";

export = new Command(script.Name)
    .addAlias("mpl")
    .setDescription(
        "<permlevel> : Sets the minimum permission level required to buy and sell items from the marketplace.",
    )
    .setExecute((sender, level) => {
        setPermLevel(sender, "marketplace", level);
    })
    .setPermissionLevel(3);
