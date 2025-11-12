import { runCLI } from "@rbxts/jest";
import { ServerScriptService } from "@rbxts/services";

export = () => {
    const root = ServerScriptService.WaitForChild("tests");
    const [success, output] = runCLI(
        root,
        {
            runInBand: true,
        },
        [root],
    ).await();
    return $tuple(success, output);
};
