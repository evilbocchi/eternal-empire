import { OnInit, OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { NPC_MODELS } from "shared/constants";

type TrackingDetails = {
    model: Model;
    head: BasePart;
    neck: Motor6D;
    originalNeckC0: CFrame;
};

@Service()
export class EyeContactService implements OnInit, OnStart {

    tracking = new Map<Model, TrackingDetails>();

    onInit() {
        const npcModels = NPC_MODELS.GetChildren();

        for (const npcModel of npcModels) {
            if (!npcModel.IsA("Model")) {
                continue;
            }
            const torso = npcModel.FindFirstChild("Torso") as BasePart | undefined;
            if (torso === undefined) {
                continue;
            }

            const neck = torso.FindFirstChild("Neck") as Motor6D | undefined;
            if (neck === undefined) {
                continue;
            }

            this.tracking.set(npcModel, {
                model: npcModel,
                head: npcModel.WaitForChild("Head") as BasePart,
                neck: neck,
                originalNeckC0: neck.C0,
            });
        }
    }

    /**
     * Returns the closest target to the given model, which is the character of a player.
     * 
     * @param model The model to find the closest player to.
     * @returns The closest player's character model, or undefined if no players are close enough.
     */
    getClosestTarget(model: Model) {
        let closest: Model | undefined;
        let closestDistance = 20;
        for (const player of Players.GetPlayers()) {
            const character = player.Character;
            if (character === undefined)
                continue;
            const primaryPart = character.PrimaryPart;
            if (primaryPart === undefined)
                continue;
            const distance = model.PrimaryPart!.Position.sub(primaryPart.Position).Magnitude;
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = character;
            }
        }
        return closest;
    }

    lookAt(model: Model, partToLookAt: BasePart | undefined) {
        const details = this.tracking.get(model);
        if (details === undefined) {
            return;
        }

        const neck = details.neck;
        const headCFrame = details.head.CFrame;
        const lookAtPart = partToLookAt || details.head; // Default to head if no part is provided

        if (partToLookAt === undefined) {
            // Reset to original neck C0 if no part is provided
            neck.C0 = neck.C0.Lerp(details.originalNeckC0, 0.3);
            return;
        }

        const difference = headCFrame.Position.sub(lookAtPart.Position);
        const dist = difference.Magnitude;
        const yDiff = difference.Y;

        const dest = details.originalNeckC0.mul(CFrame.Angles(math.atan(yDiff / dist) * 0.5, 0, (((headCFrame.Position.sub(lookAtPart.Position)).Unit).Cross(headCFrame.LookVector)).Y * 0.8));
        neck.C0 = neck.C0.Lerp(dest, 0.3);
    }

    onStart() {
        task.spawn(() => {
            while (task.wait(0.05)) {
                for (const [model] of this.tracking) {
                    const closest = this.getClosestTarget(model);
                    if (closest) {
                        const lookAtPart = closest.FindFirstChild("Head") as BasePart | undefined;
                        this.lookAt(model, lookAtPart);
                    }
                    else {
                        this.lookAt(model, undefined); // Reset to original neck C0 if no player is found
                    }
                }
            }
        });
    }
}