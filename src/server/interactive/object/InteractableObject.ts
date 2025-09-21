import Signal, { Connection } from "@antivivi/lemon-signal";
import { ProximityPromptService } from "@rbxts/services";
import { Dialogue } from "server/interactive/npc/NPC";
import { HotReloader, Reloadable } from "shared/hamster/HotReload";
import { SingleWorldNode } from "shared/world/nodes/WorldNode";

class InteractableObject extends Reloadable<InteractableObject> {
    static readonly HOT_RELOADER = new HotReloader<InteractableObject>(script.Parent!, new Set([script]));
    private static promptTriggeredConnection?: RBXScriptConnection;

    worldNode?: SingleWorldNode;
    readonly interacted = new Signal<(player: Player) => void>();
    dialogue?: Dialogue;
    dialogueInteractConnection?: Connection;

    constructor(readonly id: string) {
        super(id, InteractableObject.HOT_RELOADER);
    }

    dialogueUponInteract(dialogue: Dialogue) {
        this.dialogue = dialogue;
        if (this.dialogueInteractConnection === undefined)
            this.dialogueInteractConnection = this.interacted.connect(() => {
                if (this.dialogue !== undefined) this.dialogue.talk();
            });
        return this;
    }

    onInteract(callback: (player: Player, object: this) => void) {
        this.interacted.connect((player) => callback(player, this));
        return this;
    }

    getWorldNode() {
        this.worldNode ??= new SingleWorldNode(this.id);
        return this.worldNode;
    }

    load() {
        return () => {
            this.dialogueInteractConnection?.disconnect();
            InteractableObject.promptTriggeredConnection?.Disconnect();
            table.clear(this);
        };
    }

    static {
        this.promptTriggeredConnection = ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            if (Dialogue.isInteractionEnabled === false || prompt.Parent === undefined) return;
            const interactableObject = InteractableObject.HOT_RELOADER.RELOADABLE_PER_ID.get(prompt.Parent.Name);
            if (interactableObject === undefined) return;
            Dialogue.proximityPrompts.add(prompt);
            interactableObject.interacted.fire(player);
        });
    }
}

export = InteractableObject;
