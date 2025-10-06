import { IS_STUDIO } from "shared/Context";

/**
 * Creates a simple profiling function that logs the time taken between its creation and invocation.
 * @param label A label to identify the profiling instance.
 * @returns A function that, when called, logs the duration since its creation.
 */
export default function simpleProfile(label: string) {
    if (!IS_STUDIO) return () => {};

    let start = os.clock();
    return function () {
        let duration = os.clock() - start;
        print(`${label} took ${math.floor(duration * 1000 * 100) / 100} milliseconds`);
    };
}
