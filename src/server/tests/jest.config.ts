import { Config } from "@rbxts/jest";

export = {
    ci: false,
    verbose: false,
    passWithNoTests: true,
    testMatch: ["**/*.spec"],
    setupFilesAfterEnv: [
        script.Parent!.WaitForChild("setupRbxts") as ModuleScript,
        script.Parent!.WaitForChild("setup") as ModuleScript,
    ],
} satisfies Config;
