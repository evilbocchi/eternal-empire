import { Debris, StarterGui } from "@rbxts/services";

declare global {
    /**
     * The structure of the Assets folder in StarterGui.
     * 
     * Modify this interface to match the actual structure of the Assets folder.
     */
    interface Assets extends Folder {
        Effects: Folder;
    }
}

/**
 * The Assets folder in StarterGui containing game assets.
 */
export const ASSETS = StarterGui.WaitForChild("Assets") as Assets;

/**
 * Returns a sound from the Assets folder.
 * 
 * @param soundName The name of the sound to retrieve.
 * @returns The sound instance from the Assets folder.
 */
export function getSound(soundName: string) {
    const sound = ASSETS.Sounds.FindFirstChild(soundName) as Sound | undefined;
    if (sound === undefined) {
        throw "Sound not found: " + soundName;
    }
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