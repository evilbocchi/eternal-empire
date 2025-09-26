import NPC from "server/interactive/npc/NPC";

class NameChanger extends NPC {
    constructor(id: string) {
        super(id);
    }

    override init() {
        super.init();
        if (this.rootPart) {
            this.rootPart.Anchored = true;
        }
        return () => {};
    }

    toggleAvailability(available: boolean) {
        if (this.rootPart) this.rootPart.CFrame = available ? this.startingCFrame : new CFrame(0, -1000, 0);
        return this;
    }
}

export = new NameChanger(script.Name).createDefaultMonologue(
    "Changing your name? Easy peasy! Just hand me your life savings.",
).npc;
