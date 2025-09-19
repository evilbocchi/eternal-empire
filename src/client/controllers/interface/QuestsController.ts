/**
 * @fileoverview Client controller for managing quest UI, tracking, and notifications.
 *
 * Handles:
 * - Displaying and updating quest progress and tracked quest information
 * - Managing quest completion, XP, and item rewards
 * - Integrating with UIController, EffectController, and AdaptiveTabController
 * - Handling quest notifications, sidebar integration, and quest list filtering
 *
 * The controller manages quest state, UI updates, and player feedback for quest-related events and progress.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import ReactRoblox from "@rbxts/react-roblox";
import { Debris, TweenService } from "@rbxts/services";
import { INTERFACE } from "client/controllers/core/UIController";
import EffectController from "client/controllers/world/EffectController";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";

declare global {
    type LootTableItemSlot = Frame & {
        ViewportFrame: ViewportFrame;
        TitleLabel: TextLabel;
        Background: Folder & {
            ImageLabel: ImageLabel;
        };
    };

    interface Assets {
        LootTableItemSlot: LootTableItemSlot;
    }
}

export type CompletionFrame = Frame & {
    ImageLabel: ImageLabel;
    TextLabel: TextLabel & {
        UIStroke: UIStroke;
    };
    RewardLabel: TextLabel & {
        UIStroke: UIStroke;
    };
};

/**
 * Controller responsible for managing quest tracking, notifications, standalone quest window, and quest-related player feedback.
 *
 * Handles quest progress, completion, XP/item rewards, and integrates with other controllers for UI and effects.
 * Now includes management of the standalone quest window that replaces the adaptive tab implementation.
 */
@Controller()
export default class QuestsController implements OnInit {
    oldIndex = -2;
    indexer: string | undefined = undefined;
    tween = new TweenInfo(0.2, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    lastXp = -1;
    xpTweenConnection: RBXScriptConnection | undefined = undefined;
    beamContainer = new Instance("Part");
    availableQuests = new Set<string>();

    // Standalone quest window management
    private questWindowRoot?: ReactRoblox.Root;
    private questWindowContainer: Frame;
    private isQuestWindowVisible = false;

    constructor(private effectController: EffectController) {
        // Create the container for the standalone quest window
        this.questWindowContainer = new Instance("Frame");
        this.questWindowContainer.Name = "StandaloneQuestWindowContainer";
        this.questWindowContainer.BackgroundTransparency = 1;
        this.questWindowContainer.Size = new UDim2(1, 0, 1, 0);
        this.questWindowContainer.Position = new UDim2(0, 0, 0, 0);
        this.questWindowContainer.Parent = INTERFACE;
    }

    showCompletion(completionFrame: CompletionFrame, message: string) {
        playSound("QuestComplete.mp3");
        // TODO: Update React components to show completion message
        // For now, use the effect controller if the frame is available
        try {
            completionFrame.RewardLabel.Text = message;
            this.effectController.showQuestMessage(completionFrame);
        } catch (error) {
            // If the frame is not available (due to React migration), just play sound
            warn("Quest completion frame not available - React migration in progress");
        }
    }

    phaseOutLootTableItemSlot(ltis: typeof ASSETS.LootTableItemSlot) {
        const tweenInfo = new TweenInfo(0.5);
        TweenService.Create(ltis, tweenInfo, { BackgroundTransparency: 1 }).Play();
        TweenService.Create(ltis.Background.ImageLabel, new TweenInfo(0.9), { ImageTransparency: 1 }).Play();
        TweenService.Create(ltis.ViewportFrame, tweenInfo, { ImageTransparency: 1 }).Play();
        TweenService.Create(ltis.TitleLabel, tweenInfo, { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();
        Debris.AddItem(ltis, 1);
    }

    onInit() {
        let lastLevel = -1;
        Packets.level.observe((level) => {
            if (lastLevel > -1) {
                playSound("LevelUp.mp3");
            }
            lastLevel = level;
        });

        // Simple quest info handling - React components will handle rendering via useQuestData hook
        Packets.questInfo.observe((value) => {
            // Update available quests for notification purposes
            this.availableQuests.clear();
            const level = Packets.level.get() ?? 0;
            for (const [id, quest] of value) {
                if (quest.level < 999 && level >= quest.level) {
                    const currentStage = Packets.stagePerQuest.get()?.get(id) ?? 0;
                    if (currentStage >= 0) {
                        // Not completed
                        this.availableQuests.add(id);
                    }
                }
            }
        });

        // TODO: Implement reward notifications in React components
        Packets.showXpReward.fromServer((xp) => {
            playSound("UnlockItem.mp3");
            // XP rewards now handled by React TrackedQuestWindow component
        });

        Packets.showItemReward.fromServer((items) => {
            playSound("UnlockItem.mp3");
            // Item rewards now handled by React TrackedQuestWindow component
        });

        Packets.questCompleted.fromServer((questId) => {
            const quest = Packets.questInfo.get()?.get(questId);
            if (quest === undefined) {
                warn("Quest not found for completion");
                return;
            }
            // TODO: Implement quest completion notification in React
            // For now, just play the completion sound
            playSound("QuestComplete.mp3");
        });
    }
}
