import React, { Fragment, useEffect } from "@rbxts/react";
import { createRoot, Root } from "@rbxts/react-roblox";
import { ContentProvider } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
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
    PURCHASE_GUI,
    QUESTCOMPLETION_GUI,
    QUESTS_GUI,
    SETTINGS_GUI,
    SHOP_GUI,
    START_GUI,
    STATS_GUI,
    TOOLTIPS_GUI,
    WORLD_GUI,
} from "client/controllers/core/Guis";
import BackpackWindow from "client/ui/components/backpack/BackpackWindow";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import { CurrencyGainManager } from "client/ui/components/balance/CurrencyGain";
import BuildWindow from "client/ui/components/build/BuildWindow";
import ChallengeCompletionManager from "client/ui/components/challenge/ChallengeCompletionManager";
import ChallengeHudManager from "client/ui/components/challenge/ChallengeHudManager";
import ChallengeManager from "client/ui/components/challenge/ChallengeManager";
import ChestLootManager from "client/ui/components/chest/ChestLootManager";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/item/inventory/InventoryWindow";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import ShopGui from "client/ui/components/item/shop/ShopGui";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import LevelUpManager from "client/ui/components/levelup/LevelUpManager";
import LogsWindow from "client/ui/components/logs/LogsWindow";
import DialogueWindow from "client/ui/components/npc/DialogueWindow";
import PositionManager from "client/ui/components/position/PositionManager";
import QuestCompletionManager from "client/ui/components/quest/QuestCompletionManager";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import RenameWindow from "client/ui/components/rename/RenameWindow";
import ResetRenderer from "client/ui/components/reset/ResetRenderer";
import CopyWindow from "client/ui/components/settings/CopyWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";
import performIntroSequence from "client/ui/components/start/performIntroSequence";
import StartWindow from "client/ui/components/start/StartWindow";
import StatsWindow from "client/ui/components/stats/StatsWindow";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import DocumentManager from "client/ui/components/window/DocumentManager";
import WorldRenderer from "client/ui/components/world/WorldRenderer";
import { setVisibilityMain } from "client/ui/hooks/useVisibility";
import MusicManager from "client/ui/MusicManager";
import { assets, getAsset } from "shared/asset/AssetMap";
import { IS_EDIT, IS_PUBLIC_SERVER, IS_STUDIO } from "shared/Context";
import Sandbox from "shared/Sandbox";

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
        addRoot(roots, BACKPACK_GUI).render(<BackpackWindow />);
        addRoot(roots, STATS_GUI).render(<StatsWindow />);
        addRoot(roots, PURCHASE_GUI).render(<PurchaseWindow viewportManagement={viewportManagement} />);
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

        LOCAL_PLAYER.SetAttribute("Start", IS_PUBLIC_SERVER);

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
        if (!IS_EDIT) return;

        const [success, processing] = import("client/ui/components/build/loadBuildProcessing").await();
        if (!success) return;

        const instance = processing.default();
        return () => instance.destroy();
    }, []);

    return (
        <Fragment>
            <ResetRenderer />
        </Fragment>
    );
}
