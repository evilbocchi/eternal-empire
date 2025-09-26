import { DependencyList, useEffect } from "@rbxts/react";

/**
 * A hook that runs a callback at specified intervals.
 * @param callback A function that returns the time in seconds until the next call.
 * @param deps An array of dependencies that will trigger the effect when changed.
 */
export default function useInterval(callback: () => number, deps: DependencyList) {
    useEffect(() => {
        let active = true;
        const loop = () => {
            if (!active) return;
            const waitTime = callback();
            task.delay(waitTime, loop);
        };
        loop();
        return () => {
            active = false;
        };
    }, deps);
}
