import Signal, { Connection } from "@antivivi/lemon-signal";
import { ProximityPromptService } from "@rbxts/services";
import { Dialogue } from "server/interactive/npc/NPC";
import eat from "shared/hamster/eat";
import { Identifiable, ModuleRegistry } from "shared/hamster/ModuleRegistry";
import { SingleWorldNode } from "shared/world/nodes/WorldNode";

class InteractableObject extends Identifiable {
    static readonly REGISTRY = new ModuleRegistry<InteractableObject>(script.Parent!, new Set([script]));

    worldNode?: SingleWorldNode;
    readonly interacted = new Signal<(player: Player) => void>();
    dialogue?: Dialogue;
    dialogueInteractConnection?: Connection;

    dialogueUponInteract(dialogue: Dialogue) {
        this.dialogue = dialogue;
        if (this.dialogueInteractConnection === undefined)
            this.dialogueInteractConnection = this.interacted.connect(() => {
                if (this.dialogue !== undefined) this.dialogue.talk();
            });
        return this;
    }

    onInteract(callback: (player: Player, object: this) => void) {
        eat(this.interacted.connect((player) => callback(player, this)));
        return this;
    }

    getWorldNode() {
        this.worldNode ??= new SingleWorldNode(this.id);
        return this.worldNode;
    }

    load() {
        return () => {
            this.dialogueInteractConnection?.disconnect();
            table.clear(this);
        };
    }

    static {
        const promptTriggeredConnection = ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            if (Dialogue.isInteractionEnabled === false || prompt.Parent === undefined) return;
            const interactableObject = InteractableObject.REGISTRY.OBJECTS.get(prompt.Parent.Name);
            if (interactableObject === undefined) return;
            Dialogue.proximityPrompts.add(prompt);
            interactableObject.interacted.fire(player);
        });
        eat(promptTriggeredConnection, "Disconnect");
    }
}

export = InteractableObject;
