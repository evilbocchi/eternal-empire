import Command, { CommandAPI } from "shared/commands/Command";

export = new Command(script.Name)
    .addAlias("setdonate")
    .setDescription("<amount> : Sets your donation amount.")
    .setExecute((o, a) => {
        CommandAPI.Donation.setDonated(o, tonumber(a) ?? 0);
    })
    .setPermissionLevel(4);
