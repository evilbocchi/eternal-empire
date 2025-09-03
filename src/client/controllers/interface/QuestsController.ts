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
import { combineHumanReadable } from "@antivivi/vrldk";
import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { Debris, ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import { SIDEBAR_BUTTONS } from "client/controllers/core/AdaptiveTabController";
import { OnCharacterAdded } from "client/controllers/core/ModdingController";
import { INTERFACE } from "client/controllers/core/UIController";
import EffectController from "client/controllers/world/EffectController";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import { questState } from "shared/ui/components/quest/QuestState";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";

declare global {
    type QuestOption = Frame & {
        UIStroke: UIStroke;
        Content: Frame & {
            CurrentStepLabel: TextLabel;
            RewardLabel: TextLabel;
            LengthLabel: TextLabel;
            Track: TextButton & {
                UIStroke: UIStroke;
            };
        };
        Dropdown: TextButton & {
            ImageLabel: ImageLabel;
            LevelLabel: TextLabel & {
                UIStroke: UIStroke;
            };
            NameLabel: TextLabel & {
                UIStroke: UIStroke;
            };
        };
    };

    type LootTableItemSlot = Frame & {
        ViewportFrame: ViewportFrame;
        TitleLabel: TextLabel;
        Background: Folder & {
            ImageLabel: ImageLabel;
        };
    };

    interface Assets {
        ArrowBeam: Beam;
        LootTableItemSlot: LootTableItemSlot;
        QuestsWindow: Folder & {
            QuestOption: QuestOption;
        };
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

export type LPUpgradeOption = Frame & {
    Button: ImageButton & {
        ValueLabel: TextLabel;
    };
    DescriptionLabel: TextLabel;
};

export const TRACKED_QUEST_WINDOW = INTERFACE.WaitForChild("TrackedQuestWindow") as Frame & {
    Background: Folder & {
        Frame: Frame;
    };
    Completion: CompletionFrame;
    ChallengeCompletion: CompletionFrame;
    Reset: Frame & {
        ImageLabel: ImageLabel;
        TextLabel: TextLabel & {
            UIStroke: UIStroke;
        };
        AmountLabel: TextLabel & {
            UIStroke: UIStroke;
        };
    };
    DescriptionLabel: TextLabel;
    TitleLabel: TextLabel;
    ProgressBar: CanvasGroup & {
        Bar: Bar;
    };
};

/**
 * Controller responsible for managing quest tracking, notifications, standalone quest window, and quest-related player feedback.
 *
 * Handles quest progress, completion, XP/item rewards, and integrates with other controllers for UI and effects.
 * Now includes management of the standalone quest window that replaces the adaptive tab implementation.
 */
@Controller()
export default class QuestsController implements OnInit, OnPhysics, OnCharacterAdded {
    oldIndex = -2;
    indexer: string | undefined = undefined;
    tween = new TweenInfo(0.2, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    lastXp = -1;
    xpTweenConnection: RBXScriptConnection | undefined = undefined;
    beam = ASSETS.ArrowBeam.Clone();
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

    /**
     * Shows the standalone quest window.
     */
    showQuestWindow() {
        if (this.isQuestWindowVisible) return;

        this.isQuestWindowVisible = true;
        playSound("MenuOpen.mp3");
    }

    /**
     * Hides the standalone quest window.
     */
    hideQuestWindow() {
        if (!this.isQuestWindowVisible) return;

        this.isQuestWindowVisible = false;
        playSound("MenuClose.mp3");
    }

    /**
     * Toggles the standalone quest window visibility.
     * @returns True if the window was shown, false if hidden.
     */
    toggleQuestWindow(): boolean {
        if (this.isQuestWindowVisible) {
            this.hideQuestWindow();
            return false;
        } else {
            this.showQuestWindow();
            return true;
        }
    }

    /**
     * Returns the human-readable name for a quest length value.
     * @param length The quest length value.
     */
    getLengthName(length: number) {
        switch (length) {
            case 0:
                return "Tiny";
            case 1:
                return "Short";
            case 2:
                return "Medium";
            case 3:
                return "Long";
            case 4:
                return "Journey";
            default:
                return "???";
        }
    }

    /**
     * Returns the color associated with a quest length value.
     * @param length The quest length value.
     */
    getLengthColor(length: number) {
        switch (length) {
            case 0:
                return Color3.fromRGB(143, 255, 115);
            case 1:
                return Color3.fromRGB(0, 255, 56);
            case 2:
                return Color3.fromRGB(255, 250, 0);
            case 3:
                return Color3.fromRGB(255, 123, 28);
            case 4:
                return Color3.fromRGB(255, 20, 20);
            default:
                return Color3.fromRGB(255, 255, 255);
        }
    }

    /**
     * Returns the formatted quest description for a given quest and stage.
     * @param id The quest ID.
     * @param quest The quest info.
     * @param stageNum The stage number.
     */
    getFormattedDescription(id: string, quest: QuestInfo, stageNum: number) {
        if (stageNum < 0) {
            return "Quest complete.";
        }
        const stage = quest.stages[stageNum];
        let desc = stage.description;
        if (desc === undefined) {
            return "<no description provided>";
        }
        const position = ReplicatedStorage.GetAttribute(id + stageNum) as Vector3 | undefined;
        if (position !== undefined) {
            desc = desc.gsub(
                "%%coords%%",
                `(${math.round(position.X)}, ${math.round(position.Y)}, ${math.round(position.Z)})`,
            )[0];
        }
        return desc;
    }

    /**
     * Updates the tracked quest window with the current quest and stage.
     * Now only handles beam positioning and sound effects since React handles UI.
     * @param questId The quest ID.
     * @param index The quest stage index (optional).
     */
    refreshTrackedQuestWindow(questId: string | undefined, index?: number) {
        const hasQuest = questId !== undefined && (index === undefined || index > -1);
        if (!hasQuest) {
            this.indexer = undefined;
            return;
        }
        const quest = Packets.questInfo.get()?.get(questId);
        if (quest === undefined) {
            warn("Quest not found");
            return;
        }
        if (index === undefined) {
            index = Packets.stagePerQuest.get()?.get(questId) ?? 0;
        }

        // Update beam color for quest tracking
        const color = new Color3(quest.colorR, quest.colorG, quest.colorB);
        this.beam.Color = new ColorSequence(color);

        // Play sound for quest progression
        if (this.oldIndex !== index && (questId !== "NewBeginnings" || index !== 0)) {
            playSound("QuestNextStage.mp3");
        }
        this.oldIndex = index;
        this.indexer = questId + index;
    }

    getRewardLabel(reward: Reward) {
        const items = new Array<string>();
        if (reward.xp !== undefined) {
            items.push(`${reward.xp} XP`);
        }
        if (reward.items !== undefined) {
            for (const [item, amount] of reward.items) {
                items.push(`${amount} ${Items.getItem(item)?.name}`);
            }
        }
        return combineHumanReadable(...items);
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

    refreshNotificationWindow() {
        const amount = this.availableQuests.size();
        SIDEBAR_BUTTONS.Quests.NotificationWindow.Visible = amount > 0;
        if (amount > 0) {
            SIDEBAR_BUTTONS.Quests.NotificationWindow.AmountLabel.Text = tostring(amount);
        }
    }

    onPhysics() {
        const position =
            this.indexer === undefined
                ? undefined
                : (ReplicatedStorage.GetAttribute(this.indexer) as Vector3 | undefined);
        if (position !== undefined) {
            this.beamContainer.Position = position;
            this.beam.Enabled = true;
            return;
        }
        this.beam.Enabled = false;
    }

    onCharacterAdded(character: Model) {
        this.beam.Attachment1 = new Instance("Attachment", character.WaitForChild("HumanoidRootPart"));
    }

    onInit() {
        this.beamContainer.CanCollide = false;
        this.beamContainer.Anchored = true;
        this.beamContainer.Transparency = 1;
        this.beam.Enabled = false;
        this.beam.Parent = this.beamContainer;
        this.beamContainer.Parent = Workspace;
        this.beam.Attachment0 = new Instance("Attachment", this.beamContainer);

        // Remove old UI management code - now handled by React components
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
            this.refreshNotificationWindow();
        });

        //this.trackedQuestChanged.connect((questId) => this.refreshTrackedQuestWindow(questId));

        Packets.stagePerQuest.observe((quests) => {
            const trackedQuest = questState.getTrackedQuest();
            const index = trackedQuest === undefined ? 0 : (quests.get(trackedQuest) ?? 0);
            this.indexer = trackedQuest === undefined ? undefined : trackedQuest + index;
            this.refreshTrackedQuestWindow(trackedQuest, index);
            this.refreshNotificationWindow();
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
