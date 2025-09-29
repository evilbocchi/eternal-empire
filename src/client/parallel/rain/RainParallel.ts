namespace RainParallel {
    export const ACTOR = script.Parent as Actor;

    export function setRainEnabled(enabled: boolean) {
        ACTOR.SendMessage("SetRainEnabled", enabled);
    }

    export function bindRainEnabled(callback: (enabled: boolean) => void) {
        return ACTOR.BindToMessage("SetRainEnabled", callback);
    }
}

export default RainParallel;
