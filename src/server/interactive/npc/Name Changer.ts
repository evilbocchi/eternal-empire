import NPC from "server/interactive/npc/NPC";

class NameChanger extends NPC {
    constructor(id: string) {
        super(id);

        this.rootPart!.Anchored = true;
    }

    toggleAvailability(available: boolean) {
        this.rootPart!.CFrame = available ? this.startingCFrame : new CFrame(0, -1000, 0);
        return this;
    }
}

export = new NameChanger(script.Name).createDefaultMonologue(
    "Changing your name? Easy peasy! Just hand me your life savings.",
).npc;
