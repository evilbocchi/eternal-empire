import { FletchetteEnvironment } from "@rbxts/fletchette";
import { runCLI } from "@rbxts/jest";
import { ServerScriptService } from "@rbxts/services";

export = () => {
    const root = ServerScriptService.WaitForChild("tests");
    FletchetteEnvironment.setVirtualState(true);
    const [success, output] = runCLI(
        root,
        {
            runInBand: true,
        },
        [root],
    ).await();
    return $tuple(success, output);
};
