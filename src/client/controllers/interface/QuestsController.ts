import { Controller, OnInit } from "@flamework/core";
import { ReplicatedStorage, RunService, TweenService, Workspace } from "@rbxts/services";
import { ADAPTIVE_TAB, LEVELS_WINDOW, LOCAL_PLAYER, LPUpgradeOption, QUESTS_WINDOW, TRACKED_QUEST_WINDOW } from "client/constants";
import { EffectController } from "client/controllers/EffectController";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import Quest, { Reward } from "shared/Quest";
import { UI_ASSETS, getMaxXp } from "shared/constants";
import NamedUpgrade from "shared/item/NamedUpgrade";
import NewBeginnings from "shared/quests/NewBeginnings";
import { Fletchette, Signal } from "shared/utils/fletchette";
import { combineHumanReadable } from "shared/utils/vrldk/StringUtils";

const UpgradeBoardCanister = Fletchette.getCanister("UpgradeBoardCanister");
const QuestCanister = Fletchette.getCanister("QuestCanister");
const LevelCanister = Fletchette.getCanister("LevelCanister");

@Controller()
export class QuestsController implements OnInit {

    oldIndex = -2;
    indexer: string | undefined = undefined;
    trackedQuest: string | undefined = undefined;
    trackedQuestChanged = new Signal<(quest: string | undefined) => void>();
    tween = new TweenInfo(0.2, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);
    lastXp = -1;
    xpTweenConnection: RBXScriptConnection | undefined = undefined;
    beam = UI_ASSETS.ArrowBeam.Clone();

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

    getFormattedDescription(quest: Quest, stageNum: number) {
        if (stageNum < 0) {
            return "Quest complete.";
        }
        const stage = quest.stages[stageNum];
        const noDesc = "<no description provided>";
        let desc = stage.description;
        if (desc === undefined) {
            return noDesc;
        }
        const position = ReplicatedStorage.GetAttribute(quest.id + stageNum) as Vector3 | undefined;
        if (position === undefined) {
            return desc;
        }
        desc = desc.gsub("%%coords%%", `(${position.X}, ${position.Y}, ${position.Z})`)[0];
        return desc;
    }

    refreshTrackedQuestWindow(questId: string | undefined, index?: number) {
        const hasQuest = questId !== undefined && (index === undefined || index > -1);
        TRACKED_QUEST_WINDOW.DescriptionLabel.Visible = hasQuest;
        TRACKED_QUEST_WINDOW.TitleLabel.Visible = hasQuest;
        if (!hasQuest) {
            return;
        }
        const quest = Quest.getQuest(questId);
        if (quest === undefined) {
            warn("wtf");
            return;
        }
        if (index === undefined) {
            index = QuestCanister.quests.get().get(questId) ?? 0;
        }
        TRACKED_QUEST_WINDOW.Background.Frame.BackgroundColor3 = quest.color;
        TRACKED_QUEST_WINDOW.TitleLabel.Text = quest.name ?? "no name";
        TRACKED_QUEST_WINDOW.DescriptionLabel.Text = this.getFormattedDescription(quest, index) ?? "<no description provided>";
        this.beam.Color = new ColorSequence(quest.color);
        if (this.oldIndex !== index && (questId !== NewBeginnings.id || index !== 0)) {
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
                items.push(`${amount} ${item.name}`);
            }
        }
        return combineHumanReadable(...items);
    }

    showQuestCompletion(questId: string) {
        const quest = Quest.getQuest(questId);
        if (quest === undefined) {
            warn("wtf bro");
            return;
        }
        this.uiController.playSound("Unlock");
        const complFrame = TRACKED_QUEST_WINDOW.Completion;
        complFrame.RewardLabel.Text = `${quest.name} rewards: ${this.getRewardLabel(quest.reward)}`;
        this.effectController.showQuestMessage(complFrame);
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
            TRACKED_QUEST_WINDOW.Background.ProgressBar.GroupTransparency = 1;
            TRACKED_QUEST_WINDOW.Background.ProgressBar.UIStroke.Transparency = 1;
            TRACKED_QUEST_WINDOW.Background.ProgressBar.Visible = true;
            TweenService.Create(TRACKED_QUEST_WINDOW.Background.ProgressBar, new TweenInfo(0.2), { GroupTransparency: 0}).Play();
            TweenService.Create(TRACKED_QUEST_WINDOW.Background.ProgressBar.UIStroke, new TweenInfo(0.2), { Transparency: 0 }).Play();
            TRACKED_QUEST_WINDOW.Background.ProgressBar.BarLabel.Text = text;
            const tween = TweenService.Create(TRACKED_QUEST_WINDOW.Background.ProgressBar.Fill, new TweenInfo(0.4), { Size: fillSize });
            if (this.lastXp > xp) {
                const t = TweenService.Create(TRACKED_QUEST_WINDOW.Background.ProgressBar.Fill, new TweenInfo(0.4), { Size: new UDim2(1, 0, 1, 0) });
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
                const t = TweenService.Create(TRACKED_QUEST_WINDOW.Background.ProgressBar, new TweenInfo(0.2), { GroupTransparency: 1});
                TweenService.Create(TRACKED_QUEST_WINDOW.Background.ProgressBar.UIStroke, new TweenInfo(0.2), { Transparency: 1 }).Play();
                t.Completed.Once(() => TRACKED_QUEST_WINDOW.Background.ProgressBar.Visible = false);
                t.Play();
            }));
        }
        this.lastXp = xp;
    }

    onInit() {
        const beamContainer = new Instance("Part");
        beamContainer.Anchored = true;
        beamContainer.Transparency = 1;
        this.beam.Enabled = false;
        this.beam.Parent = beamContainer;
        beamContainer.Parent = Workspace;
        this.beam.Attachment0 = new Instance("Attachment", beamContainer);
        const onCharacterAdded = (character: Model) => this.beam.Attachment1 = new Instance("Attachment", character.WaitForChild("HumanoidRootPart"));
        if (LOCAL_PLAYER.Character !== undefined) {
            onCharacterAdded(LOCAL_PLAYER.Character);
        }
        LOCAL_PLAYER.CharacterAdded.Connect((character) => onCharacterAdded(character));

        QUESTS_WINDOW.Level.Current.Activated.Connect(() => {
            this.uiController.playSound("Flip");
            this.adaptiveTabController.showAdaptiveTab("Levels");
        });
        LEVELS_WINDOW.LevelPointOptions.Respec.Activated.Connect(() => {
            this.uiController.playSound("Charge");
            LevelCanister.respec.fire();
        });
        for (const uo of LEVELS_WINDOW.UpgradeOptions.GetChildren()) {
            if (uo.IsA("Frame")) {
                const upgradeOption = uo as LPUpgradeOption;
                const upgrade = NamedUpgrade.getUpgrade(upgradeOption.Name);
                if (upgrade === undefined) {
                    warn("What id win?");
                    continue;
                }
                upgradeOption.DescriptionLabel.Text = upgrade.description ?? "<no description provided>";
                upgradeOption.Button.Transparency = 0.1;
                upgradeOption.Button.Activated.Connect(() => {
                    this.uiController.playSound(LevelCanister.getUpgrade.invoke(upgradeOption.Name, 1) ? "Charge" : "Error");
                });
                UpgradeBoardCanister.upgrades.observe((value) => upgradeOption.Button.ValueLabel.Text = tostring(value[upgradeOption.Name] ?? 0));
            }
        }
        let lastLevel = -1;
        LevelCanister.level.observe((level) => {
            QUESTS_WINDOW.Level.Current.LevelLabel.Text = `Lv. ${level}`;
            QUESTS_WINDOW.Level.ProgressBar.SetAttribute("Level", level);
            if (lastLevel > -1) {
                this.uiController.playSound("LevelUp");
            }
            this.refreshXp(LevelCanister.xp.get());
            lastLevel = level;
        });
        LevelCanister.xp.observe((xp) => this.refreshXp(xp));
        LevelCanister.remainingLevelPoints.observe((val) => {
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
        Quest.init().forEach((quest) => {
            const questOption = UI_ASSETS.QuestsWindow.QuestOption.Clone();
            questOption.Dropdown.NameLabel.Text = quest.name ?? "no name";
            questOption.Dropdown.NameLabel.TextColor3 = quest.color;
            questOption.Dropdown.LevelLabel.Text = `Lv. ${quest.level}`;
            questOption.Content.LengthLabel.Text = `Length: ${this.getLengthName(quest.length)}`;
            questOption.Content.LengthLabel.TextColor3 = this.getLengthColor(quest.length);
            questOption.Content.RewardLabel.Text = `Reward: ${this.getRewardLabel(quest.reward)}`;
            questOption.BackgroundColor3 = quest.color;
            questOption.UIStroke.Color = quest.color;
            questOption.Name = quest.id;
            const refreshDropdownLabel = () => TweenService.Create(questOption.Dropdown.ImageLabel, this.tween, { Rotation: questOption.Content.Visible ? 0 : 180 }).Play();
            questOption.Content.GetPropertyChangedSignal("Visible").Connect(() => refreshDropdownLabel());
            refreshDropdownLabel();
            questOption.Dropdown.Activated.Connect(() => {
                questOption.Content.Visible = !questOption.Content.Visible;
                moved = true;
                this.uiController.playSound("Flip");
            });
            const updateTrack = (q: string | undefined) => {
                const color = quest.id === q ? Color3.fromRGB(85, 255, 127) : Color3.fromRGB(255, 52, 52);
                questOption.Content.Track.BackgroundColor3 = color;
                questOption.Content.Track.UIStroke.Color = color;
            }
            this.trackedQuestChanged.connect((q) => updateTrack(q));
            updateTrack(this.trackedQuest);
            questOption.Content.Track.Activated.Connect(() => {
                if (this.trackedQuest === quest.id) {
                    this.trackedQuest = undefined;
                }
                else {
                    this.trackedQuest = quest.id;
                }
                this.trackedQuestChanged.fire(this.trackedQuest);
            });
            function getLayoutOrder() {
                return quest.level * quest.order;
            }
            LevelCanister.level.observe((level) => {
                const belowReq = level < quest.level;
                questOption.Dropdown.LevelLabel.TextColor3 = belowReq ? Color3.fromRGB(255, 52, 52) : Color3.fromRGB(255, 255, 255);
                questOption.LayoutOrder = belowReq ? getLayoutOrder() + 100000000 : getLayoutOrder();
                questOption.Content.Track.Visible = !belowReq;
            });
            let moved = false;
            QuestCanister.quests.observe((quests) => {
                const index = quests.get(quest.id) ?? 0;
                if (index < 0) {
                    if (moved === false) {
                        questOption.Content.Visible = false;
                    }
                    questOption.Dropdown.NameLabel.TextTransparency = 0.5;
                    questOption.Dropdown.NameLabel.UIStroke.Transparency = 0.5;
                    questOption.LayoutOrder = getLayoutOrder() + 1000000000;
                    questOption.Content.Track.Visible = false;
                }
                questOption.Content.CurrentStepLabel.Text = `- ${this.getFormattedDescription(quest, index)}`;
            });
            questOption.Parent = QUESTS_WINDOW.QuestList;
        });
        this.trackedQuestChanged.connect((questId) => this.refreshTrackedQuestWindow(questId));
        
        QuestCanister.quests.observe((quests) => {
            if (this.trackedQuest !== undefined) {
                const index = (quests.get(this.trackedQuest) ?? 0);
                this.indexer = this.trackedQuest + index;
                this.refreshTrackedQuestWindow(this.trackedQuest, index);
            }
            const toTrack = NewBeginnings.id;
            const stage = quests.get(toTrack);
            if ((stage === undefined || stage === 0) && this.trackedQuest === undefined) {
                this.trackedQuest = toTrack;
                this.trackedQuestChanged.fire(toTrack);
            }
        });
        RunService.Heartbeat.Connect(() => {
            if (this.indexer === undefined) {
                return;
            }
            const position = ReplicatedStorage.GetAttribute(this.indexer) as Vector3 | undefined;
            if (position !== undefined) {
                beamContainer.Position = position;
                this.beam.Enabled = true;
                return;
            }
            this.beam.Enabled = false;
        });
        QuestCanister.questCompleted.connect((questId) => this.showQuestCompletion(questId));
    }
}