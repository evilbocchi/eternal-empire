/**
 * @fileoverview Handles NPC eye contact and gaze tracking for immersion.
 *
 * This service provides:
 * - NPC eye contact logic
 * - Gaze tracking and player focus
 *
 * @since 1.0.0
 */
import { OnInit, OnStart, Service } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { NPC_MODELS } from "shared/world/NPC";

/**
 * Details for tracking an NPC's head and neck for eye contact.
 */
interface TrackingDetails {
    /**
     * The NPC model being tracked.
     */
    model: Model;

    /**
     * The head part of the NPC.
     */
    head: BasePart;

    /**
     * The neck joint of the NPC.
     */
    neck: Motor6D;

    /**
     * The original C0 of the neck joint, used for resetting.
     */
    originalNeckC0: CFrame;
}

/**
 * Service that manages NPC eye contact and gaze tracking for immersive interactions.
 * Updates neck orientation to look at the closest player/character within a specified distance.
 */
@Service()
export default class EyeContactService implements OnInit, OnStart {
    /**
     * Map of NPC models to their tracking details (head, neck, original C0).
     */
    tracking = new Map<Model, TrackingDetails>();

    /**
     * Initializes tracking for all NPC models with a neck joint.
     * Stores original neck C0 for smooth resetting.
     */
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
     * Finds the closest character model to the given NPC model within 20 studs.
     *
     * @param model The NPC model to check from.
     * @returns The closest character model, or undefined if none are close enough.
     */
    getClosestTarget(model: Model) {
        let closest: Model | undefined;
        let closestDistance = 20;
        for (const character of Workspace.GetChildren()) {
            if (!character.IsA("Model") || !character.FindFirstChild("Humanoid")) {
                continue; // Skip non-character models
            }
            if (character === model) {
                continue; // Skip the model itself
            }
            const primaryPart = character.PrimaryPart;
            if (primaryPart === undefined) continue;
            const distance = model.PrimaryPart!.Position.sub(primaryPart.Position).Magnitude;
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = character;
            }
        }
        return closest;
    }

    /**
     * Rotates the NPC's neck to look at the given part, or resets if no part is provided.
     *
     * @param model The NPC model to rotate.
     * @param partToLookAt The part to look at (usually a player's head), or undefined to reset.
     */
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

        // Calculate new neck C0 to look at the target
        const dest = details.originalNeckC0.mul(
            CFrame.Angles(
                math.atan(yDiff / dist) * 0.5,
                0,
                headCFrame.Position.sub(lookAtPart.Position).Unit.Cross(headCFrame.LookVector).Y * 0.8,
            ),
        );
        neck.C0 = neck.C0.Lerp(dest, 0.3);
    }

    /**
     * Starts the continuous update loop for NPC eye contact.
     * Every 0.05s, updates each tracked NPC to look at the closest player/character.
     */
    onStart() {
        task.spawn(() => {
            while (task.wait(0.05)) {
                for (const [model] of this.tracking) {
                    const closest = this.getClosestTarget(model);
                    if (closest) {
                        const lookAtPart = closest.FindFirstChild("Head") as BasePart | undefined;
                        this.lookAt(model, lookAtPart);
                    } else {
                        this.lookAt(model, undefined); // Reset to original neck C0 if no player is found
                    }
                }
            }
        });
    }
}
