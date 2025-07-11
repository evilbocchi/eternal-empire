import NPC from "shared/NPC";
import Price from "shared/Price";

export = new NPC().setAnimation("Default", 17708029763)
.createDefaultMonologue(`Buy your crates and logs here! Come on, it's a limited stock! Only for ${new Price().setCost("Funds", 1e+15).tostring()}!`)
.monologue("Ah, sorry. You need to be Level 2 to purchase stuff from me.")
.npc;