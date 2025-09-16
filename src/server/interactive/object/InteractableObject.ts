import Signal, { Connection } from "@antivivi/lemon-signal";
import { Dialogue } from "server/interactive/npc/NPC";
import { HotReloader, Reloadable } from "shared/HotReload";
import { Server } from "shared/item/ItemUtils";

class InteractableObject extends Reloadable {
    static readonly HOT_RELOADER = new HotReloader<InteractableObject>(script.Parent!, new Set([script]));

    readonly interacted = new Signal<(player: Player) => void>();
    dialogue?: Dialogue;
    dialogueInteractConnection?: Connection;

    constructor(readonly id: string) {
        super();
    }

    dialogueUponInteract(dialogue: Dialogue) {
        this.dialogue = dialogue;
        if (this.dialogueInteractConnection === undefined)
            this.dialogueInteractConnection = this.interacted.connect(() => {
                if (this.dialogue !== undefined) Server.Dialogue.talk(this.dialogue);
            });
        return this;
    }

    onInteract(callback: (player: Player, object: this) => void) {
        this.interacted.connect((player) => callback(player, this));
        return this;
    }

    unload() {
        this.dialogueInteractConnection?.disconnect();
        table.clear(this);
    }
}

export = InteractableObject;
