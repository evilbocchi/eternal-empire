import Signal from "@antivivi/lemon-signal";
import { getNPCModel } from "shared/constants";
import { Dialogue } from "shared/NPC";
import { GameAPI } from "shared/item/ItemUtils";

export class Stage {
    description: string | undefined;
    position: Vector3 | undefined;
    focus: BasePart | undefined;
    dialogue: Dialogue | undefined;
    npcModel: Model | undefined;
    npcHumanoid: Humanoid | undefined;

    completed = new Signal<() => void>();
    load?: ((stage: this) => (() => void));
    positionChanged = new Signal<(position?: Vector3) => void>();

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setFocus(instance?: Instance) {
        if (instance !== undefined && instance.IsA("BasePart")) {
            this.focus = instance;
            this.setPosition(instance.Position);
            instance.GetPropertyChangedSignal("CFrame").Connect(() => this.setPosition(instance.Position));
        }
        return this;
    }

    setNPC(npcName: string, setAsFocus?: boolean) {
        this.npcModel = getNPCModel(npcName);
        this.npcHumanoid = this.npcModel.WaitForChild("Humanoid") as Humanoid;
        if (setAsFocus === true)
            return this.setFocus(this.npcHumanoid?.RootPart);
        return this;
    }

    setPosition(position?: Vector3) {
        if (this.position !== position) {
            this.position = position;
            this.positionChanged.fire(position);
        }
        return this;
    }

    setDialogue(dialogue: Dialogue) {
        this.dialogue = dialogue;
        return this;
    }

    onLoad(load: (stage: this) => (() => void)) {
        this.load = (stage) => {
            const callback = load(stage);
            const dialogue = this.dialogue;
            if (dialogue !== undefined) {
                GameAPI.questsService.onStageReached(this, () => {
                    GameAPI.dialogueService.addDialogue(dialogue);
                });
                stage.completed.connect(() => GameAPI.dialogueService.removeDialogue(dialogue));
                return callback;
            }
            return callback;
        };
        return this;
    }

    /** Waits for the stage to start instead of as soon as the quest is available. */
    onStart(start: (stage: this) => (() => void), load?: (stage: this) => (() => void)) {
        return this.onLoad((stage) => {
            const mainCallback = load === undefined ? undefined : load(stage);
            let callback: () => void;
            GameAPI.questsService.onStageReached(this, () => {
                callback = start(stage);
            });
            return () => {
                if (callback !== undefined)
                    callback();
                if (mainCallback !== undefined)
                    mainCallback();
            };
        });
    }
}

export default class Quest {

    static questsPerId: Map<string, Quest>;
    static colors = [
        Color3.fromRGB(253, 41, 67),
        Color3.fromRGB(1, 162, 255),
        Color3.fromRGB(2, 184, 87),
        Color3.fromRGB(255, 43, 245),
        Color3.fromRGB(255, 125, 0),
        Color3.fromRGB(240, 255, 26),
        Color3.fromRGB(255, 74, 166),
        Color3.fromRGB(255, 237, 61),
        Color3.fromRGB(112, 255, 84),
        Color3.fromRGB(36, 255, 209),
    ];

    id: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    stages = new Array<Stage>();
    color: Color3;
    length = 0;
    level = 0;
    order = 0;
    loaded = false;
    reward: Reward = {};
    readonly initialized = new Signal<() => void>();
    completionDialogue: Dialogue | undefined;

    constructor(id: string) {
        this.id = id;
        this.color = Quest.colors[string.byte(id)[0] % Quest.colors.size()];
    }

    static init() {
        if (this.questsPerId === undefined) {
            const questsFolder = script.Parent?.FindFirstChild("quests");
            if (questsFolder === undefined) {
                error("How");
            }
            const questsPerId = new Map<string, Quest>();
            for (const moduleScript of questsFolder.GetDescendants()) {
                if (moduleScript.IsA("ModuleScript") && moduleScript !== script) {
                    const i = require(moduleScript);
                    if (i !== undefined) {
                        const quest = i as Quest;
                        questsPerId.set(quest.id, quest);
                    }
                }
            }
            this.questsPerId = questsPerId;
        }
        return this.questsPerId;
    }

    static getQuest(questId: string) {
        return Quest.questsPerId?.get(questId);
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    setLength(length: number) {
        this.length = length;
        return this;
    }

    setLevel(level: number) {
        this.level = level;
        return this;
    }

    setOrder(order: number) {
        this.order = order;
        return this;
    }

    setReward(reward: Reward) {
        this.reward = reward;
        return this;
    }

    setStage(number: number, stage: Stage) {
        this.stages.insert(number - 1, stage);
        return this;
    }

    addStage(stage: Stage) {
        this.stages.push(stage);
        return this;
    }

    setCompletionDialogue(dialogue: Dialogue) {
        this.completionDialogue = dialogue;
        return this;
    }

    onInit(callback: (quest: this) => void) {
        this.initialized.connect(() => callback(this));
        return this;
    }
}