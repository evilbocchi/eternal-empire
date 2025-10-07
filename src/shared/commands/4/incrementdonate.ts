import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("changedonate")
    .setDescription("<delta> : Increments your total donated amount by a specified amount.")
    .setExecute((sender, delta) => {
        if (sender === undefined) {
            warn("incrementdonate command can only be run by a player.");
            return;
        }
        CommandAPI.Donation.incrementDonated(sender, tonumber(delta) ?? 0);
    })
    .setPermissionLevel(4);
