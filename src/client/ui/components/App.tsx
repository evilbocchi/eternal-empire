import { loadAnimation } from "@antivivi/vrldk";
import React, { Fragment, useEffect } from "@rbxts/react";
import { createRoot, Root } from "@rbxts/react-roblox";
import { ContentProvider, ReplicatedStorage, StarterGui, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";
import {
    BACKPACK_GUI,
    BALANCE_GUI,
    BUILD_GUI,
    CHALLENGE_GUI,
    CHALLENGE_HUD_GUI,
    CHALLENGECOMPLETION_GUI,
    CHESTLOOT_GUI,
    CLICK_SPARKS_GUI,
    DIALOGUE_GUI,
    INTRO_GUI,
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
import QuestCompletionManager from "client/ui/components/quest/QuestCompletionManager";
import LogsWindow from "client/ui/components/logs/LogsWindow";
import DialogueWindow from "client/ui/components/npc/DialogueWindow";
import PositionManager from "client/ui/components/position/PositionManager";
import { questState } from "client/ui/components/quest/QuestState";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import RenameWindow from "client/ui/components/rename/RenameWindow";
import CopyWindow from "client/ui/components/settings/CopyWindow";
import SettingsManager from "client/ui/components/settings/SettingsManager";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";
import StartWindow from "client/ui/components/start/StartWindow";
import StatsWindow from "client/ui/components/stats/StatsWindow";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import DocumentManager from "client/ui/components/window/DocumentManager";
import WorldRenderer from "client/ui/components/world/WorldRenderer";
import { setVisibilityMain } from "client/ui/hooks/useVisibility";
import SoundManager from "client/ui/SoundManager";
import { assets, getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import { IS_EDIT, IS_PUBLIC_SERVER, IS_STUDIO } from "shared/Context";
import eat from "shared/hamster/eat";

function addRoot(roots: Set<Root>, container: Instance): Root {
    const root = createRoot(container);
    roots.add(root);
    return root;
}

let isIntroSequenceDone = false;
let isCurrentlyInIntroSequence = false;

/**
 * Plays the intro cutscene sequence, including camera, animation, and UI transitions.
 */
function doIntroSequence() {
    print("performing intro sequence");
    const humanoid = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Humanoid");
    if (humanoid === undefined) return;
    const camera = Workspace.CurrentCamera;
    if (camera === undefined) return;
    if (isIntroSequenceDone === true) return;
    isIntroSequenceDone = true;
    isCurrentlyInIntroSequence = true;
    humanoid.RootPart!.CFrame = WAYPOINTS.NewBeginningsPlayerPos.CFrame;
    const head = humanoid.Parent?.WaitForChild("Head") as BasePart;
    const transparencyParts = [head];
    for (const transparencyPart of head.GetDescendants()) {
        if (transparencyPart.IsA("BasePart")) {
            transparencyPart.LocalTransparencyModifier = 1;
            transparencyParts.push(transparencyPart);
        }
    }
    head.LocalTransparencyModifier = 1;
    const sleepingAnimation = loadAnimation(humanoid, 17789845379);
    sleepingAnimation?.Play();
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.CFrame = WAYPOINTS.NewBeginningsCamera0.CFrame;
    const blackWindow = new Instance("Frame");
    blackWindow.Size = new UDim2(1, 0, 1, 0);
    blackWindow.BackgroundColor3 = Color3.fromRGB(0, 0, 0);
    blackWindow.BackgroundTransparency = 0;
    blackWindow.Visible = true;
    blackWindow.Parent = INTRO_GUI;
    if (IS_EDIT) {
        blackWindow.Parent = StarterGui;
        eat(blackWindow);
    } else {
        blackWindow.Parent = PLAYER_GUI;
    }
    const fabricRustle = () => playSound("FabricRustle.mp3");
    task.delay(2, () => {
        fabricRustle();
        TweenService.Create(camera, new TweenInfo(0.5), { CFrame: WAYPOINTS.NewBeginningsCamera1.CFrame }).Play();
        TweenService.Create(blackWindow, new TweenInfo(2), { BackgroundTransparency: 1 }).Play();
    });
    task.delay(2.96, () => {
        fabricRustle();
        TweenService.Create(camera, new TweenInfo(0.5), { CFrame: WAYPOINTS.NewBeginningsCamera2.CFrame }).Play();
    });
    task.delay(3.7, () => {
        fabricRustle();
        TweenService.Create(camera, new TweenInfo(0.5), { CFrame: WAYPOINTS.NewBeginningsCamera3.CFrame }).Play();
    });
    task.delay(5, () => {
        playSound("JumpSwish.mp3");
        sleepingAnimation?.Stop();
        camera.CFrame = WAYPOINTS.NewBeginningsCamera4.CFrame;
        camera.CameraType = Enum.CameraType.Custom;
        humanoid.SetStateEnabled(Enum.HumanoidStateType.Jumping, true);
        for (const transparencyPart of transparencyParts) {
            transparencyPart.LocalTransparencyModifier = 0;
        }
    });
    task.delay(7.5, () => {
        questState.setTrackedQuest("NewBeginnings");
        isCurrentlyInIntroSequence = false;
    });
}

/**
 * Handles changes to the intro marker, starting or ending the intro sequence as needed.
 */
function onIntroMarkerChanged() {
    if (ReplicatedStorage.GetAttribute("Intro")) doIntroSequence();
    else {
        math.randomseed(42);
        SoundManager.refreshMusic(true);
        math.randomseed(tick());
        setVisibilityMain(true);
    }
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
        addRoot(roots, WORLD_GUI).render(<WorldRenderer />);

        LOCAL_PLAYER.SetAttribute("Start", IS_PUBLIC_SERVER);

        const cleanup = SoundManager.init();

        task.delay(1, () => {
            if (IS_PUBLIC_SERVER) {
                DocumentManager.setVisible("Start", true);
            } else {
                setVisibilityMain(true);
            }
        });

        const connection = ReplicatedStorage.GetAttributeChangedSignal("Intro").Connect(onIntroMarkerChanged);
        if (!IS_PUBLIC_SERVER) onIntroMarkerChanged();

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
            connection.Disconnect();
        };
    }, []);

    return <Fragment />;
}
