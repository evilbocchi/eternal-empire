import { Debris, ReplicatedStorage, SoundService, StarterGui } from "@rbxts/services";
import { assets } from "shared/asset/AssetMap";

declare global {
    /**
     * The structure of the Assets folder in StarterGui.
     * 
     * Modify this interface to match the actual structure of the Assets folder.
     */
    interface Assets extends Folder {
        Effects: Folder;
    }

    type AssetPath = keyof typeof assets;

    // Only asset paths that start with "assets/sounds/"
    type SoundAssetPath = Extract<AssetPath, `assets/sounds/${string}`>;

    type Filename<T extends string> = T extends `${string}/${infer Rest}` ? Filename<Rest> : T;
}

/**
 * The Assets folder in StarterGui containing game assets.
 */
export const ASSETS = StarterGui.WaitForChild("Assets") as Assets;

/**
 * The sound group for sound effects.
 * 
 * This group is used to categorize and manage sound effects in the game.
 */
export const SOUND_EFFECTS_GROUP = SoundService.WaitForChild("SoundEffectsGroup") as SoundGroup;

/**
 * Returns a sound from the Assets folder.
 * 
 * @param soundName The name of the sound to retrieve.
 * @returns The sound instance from the Assets folder.
 */
export function getSound(path: Filename<SoundAssetPath>) {
    const fullPath = "assets/sounds/" + path as AssetPath;
    const cached = ReplicatedStorage.FindFirstChild(fullPath) as Sound | undefined;
    if (cached !== undefined) {
        return cached;
    }
    const sound = new Instance("Sound");
    sound.Name = fullPath;
    sound.SoundId = assets[fullPath];
    sound.SoundGroup = SOUND_EFFECTS_GROUP;
    sound.Parent = ReplicatedStorage;
    return sound;
}

/**
 * Returns a particle emitter from the Assets folder.
 * 
 * @param effectName The name of the effect to retrieve, without the "Effect" suffix.
 * @returns The particle emitter instance from the Assets folder.
 */
export function getEffect(effectName: string) {
    return ASSETS.Effects.WaitForChild(effectName + "Effect") as ParticleEmitter;
}

/**
 * Emits a particle effect from the Assets folder.
 * 
 * @param effectName The name of the effect to emit, without the "Effect" suffix.
 * @param parent The parent instance to attach the effect to.
 * @param amount The number of particles to emit (default is 1).
 * @returns The emitted effect instance.
 */
export function emitEffect(effectName: string, parent: Instance | undefined, amount = 1) {
    const effect = getEffect(effectName).Clone();
    effect.Enabled = false;
    effect.Parent = parent;
    effect.Emit(amount);
    Debris.AddItem(effect, 4);
    return effect;
}