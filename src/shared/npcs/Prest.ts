import NPC from "shared/NPC";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new NPC()
    .setAnimation("Default", 17708029763)
    .createDefaultMonologue(
        `Buy your crates and logs here! Come on, it's a limited stock! Only for ${new CurrencyBundle().set("Funds", 1e15).toString()}!`,
    )
    .monologue("Ah, sorry. You need to be Level 2 to purchase stuff from me.").npc;
