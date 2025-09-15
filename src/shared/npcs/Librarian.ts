import NPC, { Dialogue } from "shared/world/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 18130335383)
    .createDefaultMonologue("Looking for some old books? Check the bookshelf at the furthest front to the right of me.")
    .npc;
