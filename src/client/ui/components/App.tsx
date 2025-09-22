import React, { Fragment, useEffect } from "@rbxts/react";
import { createRoot, Root } from "@rbxts/react-roblox";
import {
    BACKPACK_GUI,
    BALANCE_GUI,
    BUILD_GUI,
    CLICK_SPARKS_GUI,
    DIALOGUE_GUI,
    INVENTORY_GUI,
    LOGS_GUI,
    MAIN_LAYOUT_GUI,
    PURCHASE_GUI,
    QUESTS_GUI,
    SETTINGS_GUI,
    SHOP_GUI,
    STATS_GUI,
    TOOLTIPS_GUI,
    WORLD_GUI,
} from "client/controllers/core/Guis";
import BackpackWindow from "client/ui/components/backpack/BackpackWindow";
import BalanceWindow from "client/ui/components/balance/BalanceWindow";
import BuildWindow from "client/ui/components/build/BuildWindow";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";
import ClickSparkManager from "client/ui/components/effect/ClickSparkManager";
import InventoryWindow from "client/ui/components/item/inventory/InventoryWindow";
import PurchaseWindow from "client/ui/components/item/shop/PurchaseWindow";
import ShopGui from "client/ui/components/item/shop/ShopGui";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import LogsWindow from "client/ui/components/logs/LogsWindow";
import DialogueWindow from "client/ui/components/npc/DialogueWindow";
import PositionManager from "client/ui/components/position/PositionManager";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import RenameWindow from "client/ui/components/rename/RenameWindow";
import CopyWindow from "client/ui/components/settings/CopyWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";
import StatsWindow from "client/ui/components/stats/StatsWindow";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import WorldRenderer from "client/ui/components/world/WorldRenderer";
import { setVisibilityMain } from "client/ui/hooks/useVisibility";
import SoundManager from "client/ui/SoundManager";

function addRoot(roots: Set<Root>, container: Instance): Root {
    const root = createRoot(container);
    roots.add(root);
    return root;
}

/**
 * Entry point for the app's UI.
 * @param viewportsEnabled Whether to enable viewports in item windows.
 */
export default function App({ viewportsEnabled }: { viewportsEnabled: boolean }) {
    const viewportManagement = useCIViewportManagement({ enabled: viewportsEnabled });

    useEffect(() => {
        const roots = new Set<Root>();
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
        addRoot(roots, WORLD_GUI).render(<WorldRenderer />);

        const cleanup = SoundManager.init();

        task.delay(1, () => {
            setVisibilityMain(true);
        });

        return () => {
            for (const root of roots) {
                root.unmount();
            }
            cleanup();
        };
    }, []);

    return <Fragment />;
}
