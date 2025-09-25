import { findModels } from "@antivivi/vrldk";
import { CollectionService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { IS_EDIT, IS_SERVER } from "shared/Context";

const itemModels = new Map<string, Model>();
const folder = Workspace.FindFirstChild("ItemModels") ?? ReplicatedStorage.WaitForChild("ItemModels");

/**
 * Can be used to make a part interactive with droplets.
 *
 * @param basePart The part to make interactive.
 */
function dropletInteractive(basePart: BasePart) {
    basePart.CollisionGroup = "Item"; // item collision group can collide with droplets
    basePart.CanQuery = true;
    basePart.CanTouch = true;
}

/**
 * Macro to validate if an instance is a BasePart.
 *
 * @param instance The instance to validate.
 * @returns True if the instance is a BasePart, false otherwise.
 */
function validateBasePart(instance: Instance): instance is BasePart {
    if (!instance.IsA("BasePart")) {
        warn(`BasePart expected for`, instance, "at", instance.GetFullName());
        return false;
    }
    return true;
}

/**
 * Unpacks the children of an instance into its parent and destroys the original instance.
 * @param parent The parent instance to which the children will be moved.
 * @param instance The Folder or Model instance to unpack.
 */
function unpackInstance(parent: Instance, instance: Instance) {
    for (const unpacking of instance.GetChildren()) unpacking.Parent = parent;
    instance.Destroy();
}

/**
 * Preprocesses a model to set up collision groups, tags, and other properties for its descendants.
 * @param model The model to preprocess.
 */
export function preprocessModel(model: Model) {
    const isTool = model.IsA("Tool");
    const characters = new Set<Model>();
    let i = 0;
    for (const instance of model.GetDescendants()) {
        const name = instance.Name;
        instance.SetAttribute("uid", i++);

        if (name === "Hitbox") {
            // A part with the main purpose of checking for collision with other items.
            if (!validateBasePart(instance)) continue;
            instance.CollisionGroup = "ItemHitbox";
            instance.CanQuery = true;
            continue;
        }

        if (name === "Laser" || name === "Transformer") {
            // A part that can interact with droplets to apply an effect.
            if (!validateBasePart(instance)) continue;
            dropletInteractive(instance);
            CollectionService.AddTag(instance, "Laser");
            continue;
        }

        if (name === "Lava") {
            // A part that can interact with droplets to destroy them.
            if (!validateBasePart(instance)) continue;
            dropletInteractive(instance);
            CollectionService.AddTag(instance, "Lava");
            continue;
        }

        if (name === "Decoration" || name === "Connector" || name === "Spinner") {
            // A part that can only collide and interact with players, not droplets.
            // Use this for decorative parts to reduce the number of collision checks with droplets.
            if (!validateBasePart(instance)) continue;
            instance.CollisionGroup = "Decoration";
            instance.CanCollide = true;
            instance.CanTouch = false;
            instance.CanQuery = false;
            continue;
        }

        if (name === "Ghost") {
            // A part that cannot interact with anything at all.
            if (!validateBasePart(instance)) continue;
            instance.CollisionGroup = "Decoration";
            instance.CanCollide = false;
            instance.CanTouch = false;
            instance.CanQuery = false;
            continue;
        }

        if (name === "Antighost") {
            // A part that can only collide and interact with droplets, not players.
            // Use Antighosts to replace Decoration parts to simplify geometry and collision checks.
            if (!validateBasePart(instance)) continue;
            instance.CollisionGroup = "Antighost";
            instance.CanCollide = true;
            instance.CanTouch = false;
            instance.CanQuery = false;
            instance.Transparency = 1;
            continue;
        }

        if (name === "ShopGuiPart") {
            // A part that can be used to adorn a SurfaceGui for a shop.
            if (!validateBasePart(instance)) continue;
            instance.CollisionGroup = "Decoration";
            instance.CanQuery = true;
            instance.AddTag("Unhoverable");
            continue;
        }

        if (instance.IsA("BasePart") && instance.CollisionGroup === "Default") {
            // All other parts that can collide and interact with droplets and players.
            // This is the default case for parts that are not explicitly named.
            instance.CollisionGroup = "Item";
            instance.CanTouch = false;
            continue;
        }

        if (instance.IsA("MeshPart") || instance.IsA("UnionOperation")) {
            // Warn if a MeshPart or UnionOperation is using PreciseConvexDecomposition collision fidelity.
            // This collision fidelity is expensive and should be avoided.
            if (instance.CollisionFidelity === Enum.CollisionFidelity.PreciseConvexDecomposition) {
                warn("PreciseConvexDecomposition used in " + instance.GetFullName());
            }
            continue;
        }

        if (instance.IsA("Sound")) {
            // All sounds are set to the sound effects group.
            // Ambience sounds are looped and tagged as ambience.
            if (name === "AmbienceSound") {
                instance.Looped = true;
                CollectionService.AddTag(instance, "Ambience");
            }
            instance.SoundGroup = SOUND_EFFECTS_GROUP;
            continue;
        }

        if (instance.IsA("ProximityPrompt")) {
            // All proximity prompts are made interactive.
            CollectionService.AddTag(instance, "Interactive");
            continue;
        }

        if (
            (instance.IsA("ParticleEmitter") || instance.IsA("Beam") || instance.IsA("Script")) &&
            instance.Enabled === true
        ) {
            // All particle emitters and beams are tagged as effects.
            // All scripts are disabled to prevent them from running in-game.
            instance.AddTag("Effect");
            if (instance.IsA("Script")) {
                instance.Enabled = false;
            }
            continue;
        }

        if (instance.IsA("SurfaceGui") || instance.IsA("BillboardGui") || instance.IsA("ClickDetector")) {
            // All GUIs and click detectors are made interactive.
            const parent = instance.Parent!;
            if (parent.IsA("BasePart")) {
                parent.CanQuery = true;
                CollectionService.AddTag(parent, "Unhoverable");
            }
            continue;
        }

        if (!isTool) {
            if (instance.IsA("Folder")) {
                unpackInstance(model, instance);
                continue;
            } else if (instance.IsA("Model")) {
                const primaryPart = instance.PrimaryPart;
                if (primaryPart !== undefined) {
                    if (primaryPart.Name === "HumanoidRootPart") {
                        characters.add(instance);
                    }
                } else {
                    unpackInstance(model, instance);
                }
            }
        }
    }

    for (const character of characters) {
        const primaryPart = character.PrimaryPart;
        for (const part of character.GetChildren()) {
            if (part === primaryPart || !part.IsA("BasePart")) continue;
            part.Anchored = false;
        }
    }
}

const served = findModels(folder);
for (const model of served) {
    itemModels.set(model.Name, model);

    if (!IS_SERVER || IS_EDIT) continue;
    preprocessModel(model);
}

export const ITEM_MODELS = itemModels;
