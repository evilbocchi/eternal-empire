import { findModels } from "@antivivi/vrldk";
import { CollectionService, ReplicatedStorage, Workspace } from "@rbxts/services";
import { SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { IS_CI, IS_SERVER } from "shared/Context";

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
        warn(`BasePart expected for`, instance, 'at', instance.GetFullName());
        return false;
    }
    return true;
}

const served = findModels(folder);
for (const model of served) {
    itemModels.set(model.Name, model);

    if (!IS_SERVER || IS_CI)
        continue;

    for (const instance of model.GetDescendants()) {
        const name = instance.Name;

        if (name === "Hitbox") {
            if (!validateBasePart(instance))
                continue;
            instance.CollisionGroup = "ItemHitbox";
            continue;
        }

        if (name === "Laser" || name === "Transformer") {
            if (!validateBasePart(instance))
                continue;
            dropletInteractive(instance);
            CollectionService.AddTag(instance, "Laser");
            continue;
        }

        if (name === "Lava") {
            if (!validateBasePart(instance))
                continue;
            dropletInteractive(instance);
            CollectionService.AddTag(instance, "Lava");
            continue;
        }

        if (name === "Decoration" || name === "Connector" || name === "Spinner") { // part that can only interact with players, not droplets
            if (!validateBasePart(instance))
                continue;
            instance.CollisionGroup = "Decoration";
            instance.CanCollide = true;
            instance.CanTouch = false;
            instance.CanQuery = false;
            continue;
        }

        if (name === "Ghost") { // part that cannot interact with anything
            if (!validateBasePart(instance))
                continue;
            instance.CollisionGroup = "Decoration";
            instance.CanCollide = false;
            instance.CanTouch = false;
            instance.CanQuery = false;
            continue;
        }

        if (name === "Antighost") { // part that can only interact with droplets, not players
            if (!validateBasePart(instance))
                continue;
            instance.CollisionGroup = "Antighost";
            instance.CanCollide = true;
            instance.CanTouch = false;
            instance.CanQuery = false;
            instance.Transparency = 1;
            continue;
        }

        if (name === "ShopGuiPart") {
            if (!validateBasePart(instance))
                continue;
            instance.CollisionGroup = "Decoration";
            instance.CanQuery = true;
            instance.AddTag("Unhoverable");
            continue;
        }

        if (instance.IsA("BasePart") && instance.CollisionGroup === "Default") {
            instance.CollisionGroup = "Item";
            instance.CanTouch = false;
            continue;
        }

        if (instance.IsA("MeshPart") || instance.IsA("UnionOperation")) {
            if (instance.CollisionFidelity === Enum.CollisionFidelity.PreciseConvexDecomposition) {
                warn("PreciseConvexDecomposition used in " + instance.GetFullName());
            }
            continue;
        }

        if (instance.IsA("Sound")) {
            if (name === "AmbienceSound") {
                instance.Looped = true;
                CollectionService.AddTag(instance, "Ambience");
            }
            instance.SoundGroup = SOUND_EFFECTS_GROUP;
            continue;
        }

        if (instance.IsA("ProximityPrompt")) {
            CollectionService.AddTag(instance, "Interactive");
            continue;
        }

        const isScript = instance.IsA("Script");
        if ((instance.IsA("ParticleEmitter") || instance.IsA("Beam") || isScript) && instance.Enabled === true) {
            instance.AddTag("Effect");
            if (isScript)
                instance.Enabled = false;
            continue;
        }

        if (instance.IsA("SurfaceGui") || instance.IsA("BillboardGui") || instance.IsA("ClickDetector")) {
            const parent = instance.Parent!;
            if (parent.IsA("BasePart")) {
                parent.CanQuery = true;
                CollectionService.AddTag(parent, "Unhoverable");
            }
        }

        // ungroup descendants to improve performance
        if (instance.IsA("Folder") || (instance.IsA("Model") && instance.PrimaryPart?.Name !== "HumanoidRootPart" && (name === "Model" || instance.PrimaryPart === undefined))) {
            if (instance.IsA("Tool"))
                continue;
            for (const unpacking of instance.GetChildren())
                unpacking.Parent = model;
            instance.Destroy();
            continue;
        }
    }
}

export const ITEM_MODELS = itemModels;