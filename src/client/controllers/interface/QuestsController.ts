import Signal from "@antivivi/lemon-signal";
import { combineHumanReadable } from "@antivivi/vrldk";
import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { Debris, ReplicatedStorage, TweenService, Workspace } from "@rbxts/services";
import HotkeysController from "client/controllers/HotkeysController";
import AdaptiveTabController, { ADAPTIVE_TAB, ADAPTIVE_TAB_MAIN_WINDOW, SIDEBAR_BUTTONS } from "client/controllers/interface/AdaptiveTabController";
import { OnCharacterAdded } from "client/controllers/ModdingController";
import UIController, { INTERFACE } from "client/controllers/UIController";
import EffectController from "client/controllers/world/EffectController";
import ItemSlot from "client/ItemSlot";
import { getMaxXp } from "shared/constants";
import { ASSETS } from "shared/GameAssets";
import Items from "shared/items/Items";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

declare global {
    type QuestOption = Frame & {
        UIStroke: UIStroke;
        Content: Frame & {
            CurrentStepLabel: TextLabel,
            RewardLabel: TextLabel,
            LengthLabel: TextLabel,
            Track: TextButton & {
                UIStroke: UIStroke;
            };
        },
        Dropdown: TextButton & {
            ImageLabel: ImageLabel,
            LevelLabel: TextLabel & {
                UIStroke: UIStroke;
            },
            NameLabel: TextLabel & {
                UIStroke: UIStroke;
            };
        };
    };

    type LootTableItemSlot = Frame & {
        ViewportFrame: ViewportFrame,
        TitleLabel: TextLabel,
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
    ImageLabel: ImageLabel,
    TextLabel: TextLabel & {
        UIStroke: UIStroke;
    },
    RewardLabel: TextLabel & {
        UIStroke: UIStroke;
    };
};

export type LPUpgradeOption = Frame & {
    Button: ImageButton & {
        ValueLabel: TextLabel;
    },
    DescriptionLabel: TextLabel;
};

export const LEVELS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Levels") as Frame & {
    LevelPointOptions: Frame & {
        Respec: TextButton,
        LevelPointsLabel: TextLabel;
    },
    UpgradeOptions: Frame & {
        Stone: LPUpgradeOption,
        WhiteGem: LPUpgradeOption,
        Crystal: LPUpgradeOption;
    };
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

export const QUESTS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Quests") as Frame & {
    Level: Frame & {
        Current: TextButton & {
            NotificationLabel: ImageLabel,
            LevelLabel: TextLabel;
        },
        ProgressBar: Bar;
    },
    QuestList: Frame & {

    };
};

@Controller()
export default class QuestsController implements OnInit, OnPhysics, OnCharacterAdded {

    oldIndex = -2;
    indexer: string | undefined = undefined;
    trackedQuest: string | undefined = undefined;
    trackedQuestChanged = new Signal<(quest: string | undefined) => void>();
    tween = new TweenInfo(0.2, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    lastXp = -1;
    xpTweenConnection: RBXScriptConnection | undefined = undefined;
    beam = ASSETS.ArrowBeam.Clone();
    beamContainer = new Instance("Part");
    availableQuests = new Set<string>();

    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private hotkeysController: HotkeysController,
        private effectController: EffectController) {

    }

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

    showTrackedQuest() {
        TRACKED_QUEST_WINDOW.TitleLabel.Visible = true;
        TRACKED_QUEST_WINDOW.DescriptionLabel.Visible = true;
    }

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
            desc = desc.gsub("%%coords%%", `(${math.round(position.X)}, ${math.round(position.Y)}, ${math.round(position.Z)})`)[0];
        }
        return desc;
    }

    refreshTrackedQuestWindow(questId: string | undefined, index?: number) {
        const hasQuest = questId !== undefined && (index === undefined || index > -1);
        TRACKED_QUEST_WINDOW.DescriptionLabel.Visible = hasQuest;
        TRACKED_QUEST_WINDOW.TitleLabel.Visible = hasQuest;
        if (!hasQuest) {
            return;
        }
        const quest = Packets.questInfo.get().get(questId);
        if (quest === undefined) {
            warn("wtf");
            return;
        }
        if (index === undefined) {
            index = Packets.quests.get().get(questId) ?? 0;
        }
        const color = new Color3(quest.colorR, quest.colorG, quest.colorB);
        TRACKED_QUEST_WINDOW.Background.Frame.BackgroundColor3 = color;
        TRACKED_QUEST_WINDOW.TitleLabel.Text = quest.name ?? "no name";
        TRACKED_QUEST_WINDOW.DescriptionLabel.Text = this.getFormattedDescription(questId, quest, index) ?? "<no description provided>";
        this.beam.Color = new ColorSequence(color);
        if (this.oldIndex !== index && (questId !== "NewBeginnings" || index !== 0)) {
            this.uiController.playSound("Notification");
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
        this.uiController.playSound("Unlock");
        completionFrame.RewardLabel.Text = message;
        this.effectController.showQuestMessage(completionFrame);
    }

    refreshXp(xp: number) {
        const level = QUESTS_WINDOW.Level.ProgressBar.GetAttribute("Level") as number;
        if (level === undefined || xp === undefined) {
            return;
        }
        const maxXp = getMaxXp(level);
        QUESTS_WINDOW.Level.ProgressBar.Fill.Visible = xp !== 0;
        const fillSize = new UDim2(xp / maxXp, 0, 1, 0);
        const text = `${xp}/${maxXp} XP to Lv. ${level + 1}`;
        QUESTS_WINDOW.Level.ProgressBar.Fill.Size = fillSize;
        QUESTS_WINDOW.Level.ProgressBar.BarLabel.Text = text;

        if (this.lastXp > -1) {
            TRACKED_QUEST_WINDOW.ProgressBar.GroupTransparency = 1;
            TRACKED_QUEST_WINDOW.ProgressBar.Bar.UIStroke.Transparency = 1;
            TRACKED_QUEST_WINDOW.ProgressBar.Visible = true;
            TweenService.Create(TRACKED_QUEST_WINDOW.ProgressBar, new TweenInfo(0.2), { GroupTransparency: 0 }).Play();
            TweenService.Create(TRACKED_QUEST_WINDOW.ProgressBar.Bar.UIStroke, new TweenInfo(0.2), { Transparency: 0 }).Play();
            TRACKED_QUEST_WINDOW.ProgressBar.Bar.BarLabel.Text = text;
            const tween = TweenService.Create(TRACKED_QUEST_WINDOW.ProgressBar.Bar.Fill, new TweenInfo(0.4), { Size: fillSize });
            if (this.lastXp > xp) {
                const t = TweenService.Create(TRACKED_QUEST_WINDOW.ProgressBar.Bar.Fill, new TweenInfo(0.4), { Size: new UDim2(1, 0, 1, 0) });
                t.Completed.Once(() => tween.Play());
                t.Play();
            }
            else {
                tween.Play();
            }
            if (this.xpTweenConnection !== undefined) {
                this.xpTweenConnection.Disconnect();
            }
            this.xpTweenConnection = tween.Completed.Once(() => task.delay(1.6, () => {
                const t = TweenService.Create(TRACKED_QUEST_WINDOW.ProgressBar, new TweenInfo(0.2), { GroupTransparency: 1 });
                TweenService.Create(TRACKED_QUEST_WINDOW.ProgressBar.Bar.UIStroke, new TweenInfo(0.2), { Transparency: 1 }).Play();
                t.Completed.Once(() => TRACKED_QUEST_WINDOW.ProgressBar.Visible = false);
                t.Play();
            }));
        }
        this.lastXp = xp;
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
        const position = this.indexer === undefined ? undefined : ReplicatedStorage.GetAttribute(this.indexer) as Vector3 | undefined;
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

        QUESTS_WINDOW.Level.Current.Activated.Connect(() => {
            this.uiController.playSound("Flip");
            this.adaptiveTabController.showAdaptiveTab("Levels");
        });
        // LEVELS_WINDOW.LevelPointOptions.Respec.Activated.Connect(() => {
        //     this.uiController.playSound("Charge");
        //     Packets.respec.fire();
        // });
        for (const uo of LEVELS_WINDOW.UpgradeOptions.GetChildren()) {
            if (uo.IsA("Frame")) {
                const upgradeOption = uo as LPUpgradeOption;
                const upgrade = NamedUpgrades.ALL_UPGRADES.get(upgradeOption.Name);
                if (upgrade === undefined) {
                    warn("What id win?");
                    continue;
                }
                upgradeOption.DescriptionLabel.Text = upgrade.description ?? "<no description provided>";
                upgradeOption.Button.Transparency = 0.1;
                upgradeOption.Button.Activated.Connect(() => {
                    this.uiController.playSound(Packets.getUpgrade.invoke(upgradeOption.Name, 1) ? "Charge" : "Error");
                });
                Packets.upgrades.observe((value) => upgradeOption.Button.ValueLabel.Text = tostring(value.get(upgradeOption.Name) ?? 0));
            }
        }
        let lastLevel = -1;
        Packets.level.observe((level) => {
            QUESTS_WINDOW.Level.Current.LevelLabel.Text = `Lv. ${level}`;
            QUESTS_WINDOW.Level.ProgressBar.SetAttribute("Level", level);
            if (lastLevel > -1) {
                this.uiController.playSound("LevelUp");
            }
            this.refreshXp(Packets.xp.get());
            lastLevel = level;
        });
        Packets.xp.observe((xp) => this.refreshXp(xp));
        Packets.remainingLevelPoints.observe((val) => {
            QUESTS_WINDOW.Level.Current.NotificationLabel.Visible = val > 0;
            LEVELS_WINDOW.LevelPointOptions.LevelPointsLabel.Text = tostring(val);
        });
        this.hotkeysController.setHotkey(ADAPTIVE_TAB.CloseButton, Enum.KeyCode.X, () => {
            if (LEVELS_WINDOW.Visible === true) {
                this.uiController.playSound("Flip");
                this.adaptiveTabController.showAdaptiveTab("Quests");
                return true;
            }
            return false;
        }, "Close", 2);
        const questInfoObservation = Packets.questInfo.observe((value) => {
            for (const [id, questInfo] of value)
                onQuestReceived(id, questInfo);
            questInfoObservation.disconnect();
        });
        const onQuestReceived = (id: string, quest: QuestInfo) => {
            if (quest.level >= 999)
                return;
            this.availableQuests.add(id);
            const color = new Color3(quest.colorR, quest.colorG, quest.colorB);
            const questOption = ASSETS.QuestsWindow.QuestOption.Clone();
            questOption.Dropdown.NameLabel.Text = quest.name ?? "no name";
            questOption.Dropdown.NameLabel.TextColor3 = color;
            questOption.Dropdown.LevelLabel.Text = `Lv. ${quest.level}`;
            questOption.Content.LengthLabel.Text = `Length: ${this.getLengthName(quest.length)}`;
            questOption.Content.LengthLabel.TextColor3 = this.getLengthColor(quest.length);
            questOption.Content.RewardLabel.Text = `Reward: ${this.getRewardLabel(quest.reward)}`;
            questOption.BackgroundColor3 = color;
            questOption.UIStroke.Color = color;
            questOption.Name = id;
            let index = 0;
            let belowReq = false;
            const refreshDropdownLabel = () => TweenService.Create(questOption.Dropdown.ImageLabel, this.tween, { Rotation: questOption.Content.Visible ? 0 : 180 }).Play();
            questOption.Content.GetPropertyChangedSignal("Visible").Connect(() => refreshDropdownLabel());
            refreshDropdownLabel();
            questOption.Dropdown.Activated.Connect(() => {
                questOption.Content.Visible = !questOption.Content.Visible;
                moved = true;
                this.uiController.playSound("Flip");
            });
            const updateTrack = (q: string | undefined) => {
                const color = id === q ? Color3.fromRGB(85, 255, 127) : Color3.fromRGB(255, 52, 52);
                questOption.Content.Track.BackgroundColor3 = color;
                questOption.Content.Track.UIStroke.Color = color;
            };
            this.trackedQuestChanged.connect((q) => updateTrack(q));
            updateTrack(this.trackedQuest);
            questOption.Content.Track.Activated.Connect(() => {
                if (this.trackedQuest === id) {
                    this.trackedQuest = undefined;
                }
                else {
                    this.trackedQuest = id;
                }
                this.trackedQuestChanged.fire(this.trackedQuest);
            });
            function getLayoutOrder() {
                return (quest.level * 10) + (quest.order + 1);
            }
            const updateAvailability = () => {
                if (index < 0) {
                    this.availableQuests.delete(id);
                    if (moved === false)
                        questOption.Content.Visible = false;
                    questOption.Dropdown.NameLabel.TextTransparency = 0.5;
                    questOption.Dropdown.NameLabel.UIStroke.Transparency = 0.5;
                    questOption.Dropdown.LevelLabel.TextTransparency = 0.5;
                    questOption.Dropdown.LevelLabel.UIStroke.Transparency = 0.5;
                    questOption.LayoutOrder = getLayoutOrder() + 1000000000;
                    questOption.Content.Track.Visible = false;
                }
                else {
                    if (belowReq === true)
                        this.availableQuests.delete(id);
                    else
                        this.availableQuests.add(id);
                    questOption.Dropdown.NameLabel.TextTransparency = 0;
                    questOption.Dropdown.NameLabel.UIStroke.Transparency = 0;
                    questOption.Dropdown.LevelLabel.TextTransparency = 0;
                    questOption.Dropdown.LevelLabel.UIStroke.Transparency = 0;
                    questOption.LayoutOrder = belowReq ? getLayoutOrder() + 100000000 : getLayoutOrder();
                }
                questOption.Dropdown.LevelLabel.TextColor3 = belowReq ? Color3.fromRGB(255, 52, 52) : Color3.fromRGB(255, 255, 255);
            };
            Packets.level.observe((level) => {
                belowReq = level < quest.level;
                updateAvailability();
                this.refreshNotificationWindow();

                questOption.Content.Track.Visible = !belowReq;
            });
            let moved = false;
            Packets.quests.observe((quests) => {
                index = quests.get(id) ?? 0;
                updateAvailability();
                this.refreshNotificationWindow();
                questOption.Content.CurrentStepLabel.Text = `- ${this.getFormattedDescription(id, quest, index)}`;
            });
            questOption.Parent = QUESTS_WINDOW.QuestList;
        };
        this.trackedQuestChanged.connect((questId) => this.refreshTrackedQuestWindow(questId));

        Packets.quests.observe((quests) => {
            const index = this.trackedQuest === undefined ? 0 : (quests.get(this.trackedQuest) ?? 0);
            this.indexer = this.trackedQuest === undefined ? undefined : this.trackedQuest + index;
            this.refreshTrackedQuestWindow(this.trackedQuest, index);
            this.refreshNotificationWindow();
        });
        Packets.xpReceived.connect((xp) => {
            const lootItemSlot = ASSETS.LootTableItemSlot.Clone();
            this.uiController.playSound("ItemGet");
            lootItemSlot.Background.ImageLabel.ImageColor3 = TRACKED_QUEST_WINDOW.Background.Frame.BackgroundColor3;
            lootItemSlot.ViewportFrame.Visible = false;
            lootItemSlot.TitleLabel.Text = `+${xp} XP`;
            lootItemSlot.Parent = TRACKED_QUEST_WINDOW;
            task.delay(3, () => this.phaseOutLootTableItemSlot(lootItemSlot));
        });
        Packets.itemsReceived.connect((items) => {
            this.uiController.playSound("ItemGet");
            for (const [itemId, amount] of items) {
                const item = Items.getItem(itemId);
                if (item === undefined)
                    continue;
                const lootItemSlot = ASSETS.LootTableItemSlot.Clone();
                lootItemSlot.Background.ImageLabel.ImageColor3 = TRACKED_QUEST_WINDOW.Background.Frame.BackgroundColor3;
                ItemSlot.loadViewportFrame(lootItemSlot.ViewportFrame, item);
                lootItemSlot.TitleLabel.Text = `x${amount} ${item.name ?? item.id}`;
                lootItemSlot.Parent = TRACKED_QUEST_WINDOW;
                task.delay(3, () => this.phaseOutLootTableItemSlot(lootItemSlot));
            }
        });

        Packets.questCompleted.connect((questId) => {
            const quest = Packets.questInfo.get().get(questId);
            if (quest === undefined) {
                warn("wtf bro");
                return;
            }
            this.showCompletion(TRACKED_QUEST_WINDOW.Completion, `${quest.name} rewards: ${this.getRewardLabel(quest.reward)}`);
        });
    }
}