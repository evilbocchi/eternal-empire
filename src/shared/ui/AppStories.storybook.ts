import { Storybook } from "@rbxts/ui-labs";

const storybook: Storybook = {
    name: "Stories",
    storyRoots: [
        script.Parent!.WaitForChild("components")
    ],
};

export = storybook;