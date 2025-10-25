/// <reference types="@rbxts/types/plugin" />
import React, { Fragment, useEffect } from "@rbxts/react";
import { createRoot, Root } from "@rbxts/react-roblox";
import { ContentProvider, RunService, StarterGui, Workspace } from "@rbxts/services";
import BackpackWindow from "client/components/backpack/BackpackWindow";
import BalanceWindow from "client/components/balance/BalanceWindow";
import CurrencyGainManager from "client/components/balance/CurrencyGainManager";
import BuildWindow from "client/components/build/BuildWindow";
import ChallengeCompletionManager from "client/components/challenge/ChallengeCompletionManager";
import ChallengeHudManager from "client/components/challenge/ChallengeHudManager";
import ChallengeManager from "client/components/challenge/ChallengeManager";
import ChestLootManager from "client/components/chest/ChestLootManager";
import CommandsWindow from "client/components/commands/CommandsWindow";
import DebugOverlay from "client/components/debug/DebugOverlay";
import EffectManager from "client/components/effect/EffectManager";
import BrokenItemIndicatorRenderer from "client/components/item/BrokenItemIndicatorRenderer";
import ClientItemReplication from "client/components/item/ClientItemReplication";
import HarvestableGuiRenderer from "client/components/item/HarvestableGuiRenderer";
import InventoryWindow from "client/components/item/inventory/InventoryWindow";
import PortableBeaconWindow from "client/components/item/PortableBeaconWindow";
import PrinterRenderer from "client/components/item/printer/PrinterRenderer";
import RepairedItemEffectRenderer from "client/components/item/RepairedItemEffectRenderer";
import RepairWindow from "client/components/item/RepairWindow";
import PurchaseWindow from "client/components/item/shop/PurchaseWindow";
import ShopGui from "client/components/item/shop/ShopGui";
import UpgradeBoardRenderer from "client/components/item/upgrade/UpgradeBoardRenderer";
import LevelUpManager from "client/components/levelup/LevelUpManager";
import LogsWindow from "client/components/logs/LogsWindow";
import MarketplaceWindow from "client/components/marketplace/MarketplaceWindow";
import DialogueWindow from "client/components/npc/DialogueWindow";
import PlayerListContainer from "client/components/playerlist/PlayerListContainer";
import PositionManager from "client/components/position/PositionManager";
import PillarPuzzle from "client/components/quest/PillarPuzzle";
import QuestCompletionManager from "client/components/quest/QuestCompletionManager";
import QuestWindow from "client/components/quest/QuestWindow";
import TrackedQuestWindow from "client/components/quest/TrackedQuestWindow";
import RenameWindow from "client/components/rename/RenameWindow";
import ResetRenderer from "client/components/reset/ResetRenderer";
import CopyWindow from "client/components/settings/CopyWindow";
import SettingsManager from "client/components/settings/SettingsManager";
import SidebarButtons from "client/components/sidebar/SidebarButtons";
import performNewBeginningsWakeUp from "client/components/start/performNewBeginningsWakeUp";
import TitleScreen from "client/components/start/TitleScreen";
import StatsWindow from "client/components/stats/StatsWindow";
import ToastManager from "client/components/toast/ToastManager";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import DocumentManager from "client/components/window/DocumentManager";
import WorldRenderer from "client/components/world/WorldRenderer";
import { setVisibilityMain } from "client/hooks/useVisibility";
import MusicManager from "client/MusicManager";
import { assets, getAsset } from "shared/asset/AssetMap";
import { PLAYER_GUI } from "shared/constants";
import { IS_EDIT, IS_PUBLIC_SERVER, IS_STUDIO } from "shared/Context";
import eat from "shared/hamster/eat";
import Sandbox from "shared/Sandbox";
import LoadingScreen from "sharedfirst/LoadingScreen";

function setParent(instance: Instance) {
    instance.Parent = PLAYER_GUI;
    if (IS_EDIT) {
        eat(instance, "Destroy");
    }
}

function createScreenGui(name: string, displayOrder = 0, ignoreGuiInset = true): ScreenGui {
    const screenGui = new Instance("ScreenGui");
    screenGui.IgnoreGuiInset = ignoreGuiInset;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Name = name;
    screenGui.DisplayOrder = displayOrder;
    setParent(screenGui);
    return screenGui;
}

function createFolder(name: string): Folder {
    const folder = new Instance("Folder");
    folder.Name = name;
    setParent(folder);
    return folder;
}

function addRoot(roots: Set<Root>, container: Instance): Root {
    const root = createRoot(container);
    roots.add(root);
    return root;
}

function waitForFrames(frameCount = 3): Promise<void> {
    return new Promise((resolve) => {
        let count = 0;
        const conn = RunService.Heartbeat.Connect(() => {
            count++;
            if (count >= frameCount) {
                conn.Disconnect();
                resolve();
            }
        });
    });
}

/**
 * Entry point for the app's UI.
 * This creates roots for each major UI section and manages their lifecycle, so
 * do not rely on the returned JSX element for rendering anything.
 */
export default function App() {
    useEffect(() => {
        StarterGui.ResetPlayerGuiOnSpawn = false; // Not having this deletes folders in PlayerGui

        const roots = new Set<Root>();
        addRoot(roots, createScreenGui("DebugOverlay", 100, false)).render(<DebugOverlay />);

        addRoot(roots, createScreenGui("Title", 20)).render(<TitleScreen />);

        addRoot(roots, createScreenGui("PlayerList", 15)).render(<PlayerListContainer />);

        addRoot(roots, createScreenGui("Tooltips", 3)).render(<TooltipWindow />);
        addRoot(roots, createScreenGui("Effects", 2)).render(<EffectManager />);
        addRoot(roots, createScreenGui("Dialogue", 1)).render(<DialogueWindow />);

        // Single document windows
        addRoot(roots, createScreenGui("Build", 0)).render(<BuildWindow />);
        addRoot(roots, createScreenGui("Challenge", 0)).render(<ChallengeManager />);
        addRoot(roots, createScreenGui("Commands", 0)).render(<CommandsWindow />);
        addRoot(roots, createScreenGui("Copy", 0)).render(<CopyWindow />);
        addRoot(roots, createScreenGui("Inventory", 0)).render(<InventoryWindow />);
        addRoot(roots, createScreenGui("Logs", 0)).render(<LogsWindow />);
        addRoot(roots, createScreenGui("Marketplace", 0)).render(<MarketplaceWindow />);
        addRoot(roots, createScreenGui("PillarPuzzle", 0)).render(<PillarPuzzle />);
        addRoot(roots, createScreenGui("Purchase", 0, false)).render(<PurchaseWindow />);
        addRoot(roots, createScreenGui("PortableBeacon", 0)).render(<PortableBeaconWindow />);
        addRoot(roots, createScreenGui("Quest", 0)).render(<QuestWindow />);
        addRoot(roots, createScreenGui("Rename", 0)).render(<RenameWindow />);
        addRoot(roots, createScreenGui("Repair", 0)).render(<RepairWindow />);
        addRoot(roots, createScreenGui("Settings", 0)).render(<SettingsManager />);
        addRoot(roots, createScreenGui("Stats", 0)).render(<StatsWindow />);
        addRoot(roots, createScreenGui("TrackedQuest", 0)).render(<TrackedQuestWindow />);

        addRoot(roots, createScreenGui("Toasts", -1)).render(<ToastManager />);

        addRoot(roots, createScreenGui("ChallengeCompletion", -3)).render(<ChallengeCompletionManager />);
        addRoot(roots, createScreenGui("ChestLoot", -3)).render(<ChestLootManager />);
        addRoot(roots, createScreenGui("QuestCompletion", -3)).render(<QuestCompletionManager />);

        addRoot(roots, createScreenGui("CurrencyGain", -4, false)).render(<CurrencyGainManager />);

        addRoot(roots, createScreenGui("Balance", -5)).render(<BalanceWindow />);
        addRoot(roots, createScreenGui("LevelUp", -5)).render(<LevelUpManager />);
        addRoot(roots, createScreenGui("Position", -5)).render(<PositionManager />);
        addRoot(roots, createScreenGui("Sidebar", -5)).render(<SidebarButtons />);

        addRoot(roots, createScreenGui("ChallengeHud", -10)).render(<ChallengeHudManager />);

        addRoot(roots, createScreenGui("Backpack", -15)).render(<BackpackWindow />);

        addRoot(roots, createFolder("BrokenItemIndicators")).render(<BrokenItemIndicatorRenderer />);
        addRoot(roots, createFolder("Harvestable")).render(<HarvestableGuiRenderer />);
        addRoot(roots, createFolder("RepairedItemEffects")).render(<RepairedItemEffectRenderer />);
        addRoot(roots, createFolder("Printer")).render(<PrinterRenderer />);
        addRoot(roots, createFolder("Shop")).render(<ShopGui />);
        addRoot(roots, createFolder("UpgradeBoard")).render(<UpgradeBoardRenderer />);
        addRoot(roots, createFolder("World")).render(<WorldRenderer />);

        Workspace.SetAttribute("Title", IS_PUBLIC_SERVER);
        const cleanup = MusicManager.init();

        task.delay(1, () => {
            waitForFrames(30).then(() => {
                LoadingScreen.hideLoadingScreen();

                if (IS_PUBLIC_SERVER) {
                    DocumentManager.setVisible("Title", true);
                } else if (Sandbox.getEnabled()) {
                    setVisibilityMain(true);
                } else {
                    performNewBeginningsWakeUp();
                }
            });
        });

        task.spawn(() => {
            if (IS_STUDIO) {
                eat(() => {
                    const setWaypoint = (key: string) => {
                        game.GetService("ChangeHistoryService").SetWaypoint(key);
                    };

                    const [success, result] = pcall(() => {
                        setWaypoint("SimulationClosing");
                        task.delay(1, () => setWaypoint("SimulationDone"));
                    });
                    if (!success) warn(`[ChangeHistoryService] Failed to set waypoint: ${result}`);
                });
                return;
            }

            const priority = [
                getAsset("assets/sounds/FabricRustle.mp3"),
                getAsset("assets/sounds/JumpSwish.mp3"),
                getAsset("assets/sounds/DefaultText.mp3"),
                getAsset("assets/sounds/QuestComplete.mp3"),
                getAsset("assets/sounds/QuestNextStage.mp3"),
            ];
            for (const [_, id] of pairs(assets)) {
                if (!priority.includes(id)) priority.push(id);
            }
            ContentProvider.PreloadAsync(priority);
        });

        return () => {
            for (const root of roots) {
                root.unmount();
            }
            cleanup();
        };
    }, []);

    ClientItemReplication.useManualItemReplication();

    return (
        <Fragment>
            <ResetRenderer />
        </Fragment>
    );
}
