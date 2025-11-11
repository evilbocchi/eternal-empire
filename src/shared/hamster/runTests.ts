import { FletchetteEnvironment } from "@rbxts/fletchette";
import { runCLI } from "@rbxts/jest";
import { ServerScriptService } from "@rbxts/services";
import { IS_EDIT } from "shared/Context";

export = () => {
    const root = ServerScriptService.WaitForChild("tests");

    if (IS_EDIT) {
        FletchetteEnvironment.setVirtualState(true);
    }

    const [success, output] = runCLI(
        root,
        {
            runInBand: true,
        },
        [root],
    ).await();

    return $tuple(success, output);
};
