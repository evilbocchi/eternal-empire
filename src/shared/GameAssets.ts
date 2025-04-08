import { Debris, StarterGui } from "@rbxts/services";

declare global {
    interface Assets extends Folder {
        Effects: Folder;
    }
}

export const ASSETS = StarterGui.WaitForChild("Assets") as Assets;

export function getSound(soundName: string) {
    return ASSETS.Sounds.WaitForChild(soundName + "Sound") as Sound;
}

export function getEffect(effectName: string) {
    return ASSETS.Effects.WaitForChild(effectName + "Effect") as ParticleEmitter;
}

export function emitEffect(effectName: string, parent: Instance | undefined, amount = 1) {
    const effect = getEffect(effectName).Clone();
    effect.Enabled = false;
    effect.Parent = parent;
    effect.Emit(amount);
    Debris.AddItem(effect, 4);
    return effect;
}