import { ServerScriptService } from "@rbxts/services";
import TestEZ from "@rbxts/testez";

const root = ServerScriptService!;
print(`Running tests in: ${root.GetFullName()}`);
TestEZ.TestBootstrap.run([root]);