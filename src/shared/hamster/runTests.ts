import { FletchetteEnvironment } from "@rbxts/fletchette";
import { Janitor } from "@rbxts/janitor";
import { runCLI } from "@rbxts/jest";
import { ServerScriptService } from "@rbxts/services";
import { eater } from "shared/hamster/eat";

export = () => {
    const root = ServerScriptService.WaitForChild("tests");

    const janitor = new Janitor();
    eater.janitor = janitor; // Tests should create their own janitors, but ensure the entire test suite is sandboxed
    FletchetteEnvironment.setVirtualState(true);

    const [success, output] = runCLI(root, {}, [root]).await();

    janitor.Destroy();
    return $tuple(success, output);
};
