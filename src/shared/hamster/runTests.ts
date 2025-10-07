import { Janitor } from "@rbxts/janitor";
import { ServerScriptService } from "@rbxts/services";
import TestEZ from "@rbxts/testez";
import { eater } from "shared/hamster/eat";

export = () => {
    const root = ServerScriptService;
    print(`Running tests in: ${root.GetFullName()}`);

    let t = os.clock();
    const janitor = new Janitor();
    eater.janitor = janitor; // Tests should create their own janitors, but ensure the entire test suite is sandboxed

    TestEZ.TestBootstrap.run([root]);

    janitor.Destroy();
    print(`Tests completed in ${math.floor((os.clock() - t) * 1000 * 100) / 100}ms`);
};
