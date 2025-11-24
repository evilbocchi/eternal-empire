import { afterAll, afterEach, describe, expect, it, jest } from "@rbxts/jest-globals";
import React from "@rbxts/react";
import { Root, createRoot } from "@rbxts/react-roblox";
import { ReplicatedStorage, RunService, StarterGui, Workspace } from "@rbxts/services";
import App from "client/components/App";
import DocumentManager from "client/components/window/DocumentManager";
import { SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import getPlayerBackpack from "shared/hamster/getPlayerBackpack";
import LoadingScreen from "sharedfirst/LoadingScreen";

type MountContext = {
    root: Root;
    container: Folder;
    previousSandbox: boolean | undefined;
};

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

function mountApp(): MountContext {
    const previousSandbox = Workspace.GetAttribute("Sandbox") as boolean | undefined;
    // Enable Sandbox mode to prevent the intro sequence from starting
    Workspace.SetAttribute("Sandbox", true);

    const container = new Instance("Folder") as Folder;
    container.Name = "AppContainer";
    container.Parent = ReplicatedStorage;
    const root = createRoot(container);
    root.render(React.createElement(App, {}));
    for (let i = 0; i < 30; i++) {
        RunService.Heartbeat.Wait();
    }
    return { root, container, previousSandbox };
}

function cleanupMount(mount?: MountContext) {
    if (!mount) return;
    mount?.root.unmount();
    mount?.container.Destroy();
    Workspace.SetAttribute("Sandbox", mount.previousSandbox);
}

let mount: MountContext | undefined;

afterEach(() => {
    cleanupMount(mount);
    mount = undefined;
});

afterAll(() => {
    PLACED_ITEMS_FOLDER.Destroy();
    SOUND_EFFECTS_GROUP.Destroy();
    getPlayerBackpack()?.Destroy();

    // Clean up Sandbox attribute
    Workspace.SetAttribute("Sandbox", undefined);
});

describe("App", () => {
    it("loads", () => {
        mount = mountApp();
        expect(mount?.container).toBeDefined();
    });

    it("creates expected roots in PlayerGui", () => {
        mount = mountApp();
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
        mount = mountApp();
        const loadingGui = new Instance("ScreenGui") as ScreenGui;
        loadingGui.Name = "LoadingScreen";
        loadingGui.ResetOnSpawn = false;
        loadingGui.IgnoreGuiInset = true;
        loadingGui.Parent = StarterGui;

        LoadingScreen.showLoadingScreen("Integration Test", true, loadingGui);
        expect(loadingGui.Enabled).toBe(true);

        LoadingScreen.hideLoadingScreen(0);
        const hidden = waitUntil(() => loadingGui.Enabled === false);
        expect(hidden).toBe(true);

        loadingGui.Destroy();
    });

    it("only shows main UI after documents register", () => {
        const originalSetVisible = DocumentManager.setVisible;
        const setVisibleSpy = jest.spyOn(DocumentManager, "setVisible").mockImplementation((id, visible) => {
            expect(DocumentManager.INFO_PER_DOCUMENT.has(id)).toBe(true);
            return originalSetVisible(id, visible);
        });

        try {
            mount = mountApp();
            const callsObserved = waitUntil(() => setVisibleSpy.mock.calls.size() >= 1, 8);
            expect(callsObserved).toBe(true);
        } finally {
            setVisibleSpy.mockRestore();
        }
    });
});
