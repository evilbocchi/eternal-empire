import { runCLI } from "@rbxts/jest";
import { ServerStorage } from "@rbxts/services";

/**
 * Execute the test suite in `src/server/tests`.
 * @param color Whether to enable colored output.
 * @returns A tuple containing a boolean indicating success and an object representing Jest output.
 */
export = (color = false) => {
    const root = ServerStorage.WaitForChild("tests");

    // force chalk to load with the right color level
    const [chalkSuccess, Chalk] = import("@rbxts-js/chalk-lua").await();
    if (chalkSuccess) {
        (Chalk as unknown as { level: number }).level = color ? 3 : 0;
    }

    // run jest
    const [success, output] = runCLI(
        root,
        {
            runInBand: true,
        },
        [root],
    ).await();
    return $tuple(success, output);
};
