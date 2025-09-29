import VirtualActor from "shared/hamster/VirtualActor";

namespace RainParallel {
    export const ACTOR = new VirtualActor(script.Parent as Actor);

    export function setRainEnabled(enabled: boolean) {
        ACTOR.sendMessage("SetRainEnabled", enabled);
    }

    export function bindRainEnabled(callback: (enabled: boolean) => void) {
        return ACTOR.bindToMessage("SetRainEnabled", callback);
    }
}

export default RainParallel;
