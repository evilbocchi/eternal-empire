import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("setdonate")
    .setDescription("<amount> : Sets your donation amount.")
    .setExecute((sender, amount) => {
        if (sender === undefined) {
            warn("setdonation command can only be run by a player.");
            return;
        }
        CommandAPI.Donation.setDonated(sender, tonumber(amount) ?? 0);
    })
    .setPermissionLevel(4);
