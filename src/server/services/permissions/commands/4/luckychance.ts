import Command, { CommandAPI } from "server/services/permissions/commands/Command";
import Dropper from "shared/item/traits/dropper/Dropper";

export = new Command(script.Name)
    .addAlias("lc")
    .setDescription(
        "<chance> : Set the lucky droplet chance. 1000 = 1/1000 chance, 1 = every droplet is lucky, 0 = disabled.",
    )
    .setExecute((_player, newChance) => {
        const chance = tonumber(newChance) ?? 1000;
        if (chance < 0) {
            CommandAPI.ChatHook.sendServerMessage("Lucky droplet chance cannot be negative. Use 0 to disable.");
            return;
        }
        CommandAPI.ChatHook.sendServerMessage(
            `Changed lucky droplet chance to 1/${chance === 0 ? "disabled" : chance}. Old chance: 1/${Dropper.luckyChance === 0 ? "disabled" : Dropper.luckyChance}`,
        );
        Dropper.luckyChance = chance;
    })
    .setPermissionLevel(4);
