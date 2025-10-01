import VirtualActor from "shared/hamster/VirtualActor";
import { WeatherState } from "shared/weather/WeatherTypes";

namespace RainParallel {
    export const ACTOR = new VirtualActor(script.Parent as Actor);

    export function setWeatherState(state: WeatherState) {
        ACTOR.sendMessage("SetWeatherState", state);
    }

    export function bindWeatherState(callback: (state: WeatherState) => void) {
        return ACTOR.bindToMessage("SetWeatherState", callback);
    }
}

export default RainParallel;
