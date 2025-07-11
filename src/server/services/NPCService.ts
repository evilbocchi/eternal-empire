import { OnStart, Service } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { NPCS, UI_ASSETS } from "shared/constants";
import { Fletchette, RemoteSignal } from "shared/utils/fletchette";

declare global {
    interface FletchetteCanisters {
        NPCCanister: typeof NPCCanister;
    }
}

const NPCCanister = Fletchette.createCanister("NPCCanister", {
    npcMessage: new RemoteSignal<(npc: Model, message: string) => void>(),
});

@Service()
export class NPCService implements OnStart {

    onStart() {
        const ding = UI_ASSETS.Sounds.WaitForChild("DingSound") as Sound;
        const npcs = NPCS.GetChildren();
        for (const npc of npcs) {
            if (npc.IsA("Model")) {
                const defaultDialog = npc.FindFirstChild("Default");
                if (defaultDialog === undefined || !defaultDialog.IsA("Dialog")) {
                    continue;
                }
                npc.PrimaryPart!.Anchored = true;
                const sound = ding.Clone();
                sound.Parent = npc;
                const indicator = UI_ASSETS.NPCNotification.Clone();
                indicator.Enabled = true;
                indicator.Parent = npc.WaitForChild("Head");
                const showIndicator = TweenService.Create(indicator.ImageLabel, new TweenInfo(0.3), { ImageTransparency: 0 });
                const hideIndicator = TweenService.Create(indicator.ImageLabel, new TweenInfo(0.15), { ImageTransparency: 1 });
                const prompt = new Instance("ProximityPrompt");
                prompt.GetPropertyChangedSignal("Enabled").Connect(() => {
                    if (prompt.Enabled)
                        showIndicator.Play();
                    else
                        hideIndicator.Play();
                });
                prompt.ObjectText = npc.Name;
                prompt.ActionText = "Interact";
                prompt.Enabled = true;
                prompt.RequiresLineOfSight = false;
                prompt.Parent = npc;
                prompt.Triggered.Connect((player) => {
                    print(`${player.Name} interacted`);
                    sound.Play();
                    prompt.Enabled = false;
                    NPCCanister.npcMessage.fireAll(npc, defaultDialog.InitialPrompt);
                    task.delay(3, () => prompt.Enabled = true);
                });
            }
        }
    }
}