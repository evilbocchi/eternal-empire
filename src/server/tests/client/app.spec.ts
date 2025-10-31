import { Janitor } from "@rbxts/janitor";
import { afterAll, beforeAll, describe, expect, it } from "@rbxts/jest-globals";
import React from "@rbxts/react";
import { Root, createRoot } from "@rbxts/react-roblox";
import { ReplicatedStorage, RunService, StarterGui } from "@rbxts/services";
import App from "client/components/App";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import LoadingScreen from "sharedfirst/LoadingScreen";

type MountContext = {
    root: Root;
    container: Folder;
    originalChildren: Set<Instance>;
};

function mountApp(): MountContext {
    const container = new Instance("Folder") as Folder;
    container.Name = "AppContainer";
    container.Parent = ReplicatedStorage;
    const root = createRoot(container);
    const originalChildren = new Set<Instance>(StarterGui.GetChildren());
    root.render(React.createElement(App, {}));
    for (let i = 0; i < 300; i++) {
        RunService.Heartbeat.Wait();
    }

    return { root, container, originalChildren };
}

function cleanupMount({ root, container, originalChildren }: MountContext) {
    root.unmount();
    container.Destroy();
    for (const child of StarterGui.GetChildren()) {
        if (!originalChildren.has(child)) {
            child.Destroy();
        }
    }
}

function waitUntil(condition: () => boolean, timeout = 5) {
    const start = os.clock();
    while (os.clock() - start < timeout) {
        if (condition()) {
            return true;
        }
        RunService.Heartbeat.Wait();
    }
    return condition();
}

let mount: MountContext;
beforeAll(() => {
    eater.janitor = new Janitor();
    mockFlamework();
    mount = mountApp();
});

afterAll(() => {
    eater.janitor?.Destroy();
    cleanupMount(mount);
});

describe("App", () => {
    it("loads", () => {
        expect(mount.container).toBeDefined();
    });

    it("creates expected roots in PlayerGui", () => {
        const expectedRoots: Array<[string, keyof Instances]> = [
            ["DebugOverlay", "ScreenGui"],
            ["Title", "ScreenGui"],
            ["PlayerList", "ScreenGui"],
            ["Tooltips", "ScreenGui"],
            ["Effects", "ScreenGui"],
            ["Dialogue", "ScreenGui"],
            ["Build", "ScreenGui"],
            ["Inventory", "ScreenGui"],
            ["Marketplace", "ScreenGui"],
            ["Purchase", "ScreenGui"],
            ["Quest", "ScreenGui"],
            ["Sidebar", "ScreenGui"],
            ["Backpack", "ScreenGui"],
            ["World", "Folder"],
            ["BrokenItemIndicators", "Folder"],
        ];

        for (const [name, className] of expectedRoots) {
            const instance = StarterGui.FindFirstChild(name);
            expect(instance).toBeDefined();
            if (!instance) continue;
            expect(instance!.IsA(className)).toBe(true);
        }
    });

    it("hides the loading screen after initialization completes", () => {
        const loadingGui = new Instance("ScreenGui") as ScreenGui;
        loadingGui.Name = "LoadingScreen";
        loadingGui.ResetOnSpawn = false;
        loadingGui.IgnoreGuiInset = true;
        loadingGui.Parent = StarterGui;

        LoadingScreen.showLoadingScreen("Integration Test", true, loadingGui);
        expect(loadingGui.Enabled).toBe(true);

        LoadingScreen.hideLoadingScreen();
        const hidden = waitUntil(() => loadingGui.Enabled === false);
        expect(hidden).toBe(true);

        cleanupMount(mount);
        loadingGui.Destroy();
    });
});
