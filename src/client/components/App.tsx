import React, { Fragment, useEffect } from "@rbxts/react";
import { createRoot, Root } from "@rbxts/react-roblox";
import { ContentProvider, RunService, Workspace } from "@rbxts/services";
import BackpackWindow from "client/components/backpack/BackpackWindow";
import BalanceWindow from "client/components/balance/BalanceWindow";
import { CurrencyGainManager } from "client/components/balance/CurrencyGain";
import BuildWindow from "client/components/build/BuildWindow";
import ChallengeCompletionManager from "client/components/challenge/ChallengeCompletionManager";
import ChallengeHudManager from "client/components/challenge/ChallengeHudManager";
import ChallengeManager from "client/components/challenge/ChallengeManager";
import ChestLootManager from "client/components/chest/ChestLootManager";
import CommandsWindow from "client/components/commands/CommandsWindow";
import ClickSparkManager from "client/components/effect/ClickSparkManager";
import InventoryWindow from "client/components/item/inventory/InventoryWindow";
import PortableBeaconWindow from "client/components/item/PortableBeaconWindow";
import PrinterRenderer from "client/components/item/printer/PrinterRenderer";
import PurchaseWindow from "client/components/item/shop/PurchaseWindow";
import ShopGui from "client/components/item/shop/ShopGui";
import UpgradeBoardRenderer from "client/components/item/upgrade/UpgradeBoardRenderer";
import useCIViewportManagement from "client/components/item/useCIViewportManagement";
import LevelUpManager from "client/components/levelup/LevelUpManager";
import LogsWindow from "client/components/logs/LogsWindow";
import DialogueWindow from "client/components/npc/DialogueWindow";
import PositionManager from "client/components/position/PositionManager";
import QuestCompletionManager from "client/components/quest/QuestCompletionManager";
import QuestWindow from "client/components/quest/QuestWindow";
import TrackedQuestWindow from "client/components/quest/TrackedQuestWindow";
import RenameWindow from "client/components/rename/RenameWindow";
import ResetRenderer from "client/components/reset/ResetRenderer";
import CopyWindow from "client/components/settings/CopyWindow";
import SettingsManager from "client/components/settings/SettingsManager";
import SidebarButtons from "client/components/sidebar/SidebarButtons";
import performIntroSequence from "client/components/start/performIntroSequence";
import StartWindow from "client/components/start/StartWindow";
import StatsWindow from "client/components/stats/StatsWindow";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import DocumentManager from "client/components/window/DocumentManager";
import WorldRenderer from "client/components/world/WorldRenderer";
import {
    BACKPACK_GUI,
    BALANCE_GUI,
    BUILD_GUI,
    CHALLENGE_GUI,
    CHALLENGE_HUD_GUI,
    CHALLENGECOMPLETION_GUI,
    CHESTLOOT_GUI,
    CLICK_SPARKS_GUI,
    CURRENCY_GAIN_GUI,
    DIALOGUE_GUI,
    INVENTORY_GUI,
    LEVELUP_GUI,
    LOGS_GUI,
    MAIN_LAYOUT_GUI,
    PRINTER_GUI,
    PURCHASE_GUI,
    QUESTCOMPLETION_GUI,
    QUESTS_GUI,
    SETTINGS_GUI,
    SHOP_GUI,
    START_GUI,
    STATS_GUI,
    TOOLTIPS_GUI,
    UPGRADEBOARD_GUI,
    WORLD_GUI,
} from "client/controllers/core/Guis";
import useManualItemReplication from "client/hooks/useManualItemReplication";
import { setVisibilityMain } from "client/hooks/useVisibility";
import MusicManager from "client/MusicManager";
import { assets, getAsset } from "shared/asset/AssetMap";
import { IS_EDIT, IS_PUBLIC_SERVER, IS_STUDIO } from "shared/Context";
import Sandbox from "shared/Sandbox";

declare global {
    interface RunService {
        Run: (this: RunService) => void;
        Stop: (this: RunService) => void;
    }
}

function addRoot(roots: Set<Root>, container: Instance): Root {
    const root = createRoot(container);
    roots.add(root);
    return root;
}
/**
 * Entry point for the app's UI.
 * This creates roots for each major UI section and manages their lifecycle, so
 * do not rely on the returned JSX element for rendering anything.
 * @param viewportsEnabled Whether to enable viewports in item windows.
 */
export default function App({ viewportsEnabled }: { viewportsEnabled: boolean }) {
    const viewportManagement = useCIViewportManagement({ enabled: viewportsEnabled });

    useEffect(() => {
        const roots = new Set<Root>();
        addRoot(roots, START_GUI).render(<StartWindow />);
        addRoot(roots, MAIN_LAYOUT_GUI).render(
            <Fragment>
                <PositionManager />
                <SidebarButtons />
            </Fragment>,
        );
        addRoot(roots, CLICK_SPARKS_GUI).render(<ClickSparkManager />);
        addRoot(roots, TOOLTIPS_GUI).render(<TooltipWindow />);
        addRoot(roots, DIALOGUE_GUI).render(<DialogueWindow />);
        addRoot(roots, BALANCE_GUI).render(<BalanceWindow />);
        addRoot(roots, BUILD_GUI).render(<BuildWindow />);
        addRoot(roots, CURRENCY_GAIN_GUI).render(<CurrencyGainManager />);
        addRoot(roots, SETTINGS_GUI).render(
            <Fragment>
                <CopyWindow />
                <SettingsManager />
                <CommandsWindow />
                <RenameWindow />
            </Fragment>,
        );
        addRoot(roots, INVENTORY_GUI).render(<InventoryWindow viewportManagement={viewportManagement} />);
        addRoot(roots, LOGS_GUI).render(<LogsWindow />);
        addRoot(roots, QUESTS_GUI).render(
            <Fragment>
                <QuestWindow />
                <TrackedQuestWindow />
            </Fragment>,
        );
        addRoot(roots, BACKPACK_GUI).render(
            <Fragment>
                <BackpackWindow />
                <PortableBeaconWindow />
            </Fragment>,
        );
        addRoot(roots, STATS_GUI).render(<StatsWindow />);
        addRoot(roots, PURCHASE_GUI).render(<PurchaseWindow viewportManagement={viewportManagement} />);
        addRoot(roots, UPGRADEBOARD_GUI).render(<UpgradeBoardRenderer />);
        addRoot(roots, PRINTER_GUI).render(<PrinterRenderer />);
        addRoot(roots, SHOP_GUI).render(<ShopGui viewportManagement={viewportManagement} />);
        addRoot(roots, LEVELUP_GUI).render(<LevelUpManager />);
        addRoot(roots, QUESTCOMPLETION_GUI).render(<QuestCompletionManager />);
        addRoot(roots, CHALLENGECOMPLETION_GUI).render(<ChallengeCompletionManager />);
        addRoot(roots, CHESTLOOT_GUI).render(<ChestLootManager />);
        addRoot(roots, CHALLENGE_GUI).render(<ChallengeManager />);
        addRoot(roots, CHALLENGE_HUD_GUI).render(<ChallengeHudManager />);
        if (!Sandbox.getEnabled()) {
            addRoot(roots, WORLD_GUI).render(<WorldRenderer />);
        }

        Workspace.SetAttribute("Start", IS_PUBLIC_SERVER);

        const cleanup = MusicManager.init();

        task.delay(1, () => {
            if (IS_PUBLIC_SERVER) {
                DocumentManager.setVisible("Start", true);
            } else if (Sandbox.getEnabled()) {
                setVisibilityMain(true);
            } else {
                performIntroSequence();
            }
        });

        task.spawn(() => {
            if (!IS_STUDIO) {
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
            }
        });

        return () => {
            for (const root of roots) {
                root.unmount();
            }
            cleanup();
        };
    }, []);

    useEffect(() => {
        // Special hook to load build processing directly in this thread in edit mode
        if (!IS_EDIT) return;

        const [success, processing] = import("client/components/build/loadBuildProcessing").await();
        if (!success) return;

        const instance = processing.default();
        return () => instance.destroy();
    }, []);

    useEffect(() => {
        if (!IS_EDIT) return;

        const t = os.clock();
        let safeToStartPhysics = true;
        for (const part of Workspace.GetDescendants()) {
            if (part.IsA("BasePart") && !part.Anchored) {
                if (part.HasTag("Droplet")) continue;
                safeToStartPhysics = false;
                print("Unanchored part found", part);
            }
        }
        if (os.clock() - t > 0.05) {
            warn("App: Part scan took too long, took", os.clock() - t, "seconds");
        }

        if (safeToStartPhysics) {
            RunService.Run();
        }

        return () => {
            if (safeToStartPhysics) {
                RunService.Stop();
            }
        };
    }, []);

    useManualItemReplication();

    return (
        <Fragment>
            <ResetRenderer />
        </Fragment>
    );
}
