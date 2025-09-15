import NPC from "server/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 17708029763)
    .createDefaultMonologue(
        `Heard of Ice Cream? Well, it's back with a new name: Steam Beams! It's delicious, trust me!`,
    ).npc;
