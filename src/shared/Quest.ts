import { AREAS } from "./constants";
import Item from "./item/Item";
import { Signal } from "./utils/fletchette";

export type Reward = {
    items?: Map<Item, number>,
    xp?: number,
    area?: keyof (typeof AREAS),
}

export class Stage {
    description: string | undefined = undefined;
    position: Vector3 | undefined = undefined;
    completed = new Signal<() => void>();
    load: ((utils: ItemUtils, stage: this) => (() => void)) | undefined = undefined;
    positionChanged = new Signal<(position: Vector3) => void>();

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setPosition(position: Vector3) {
        if (this.position !== position) {
            this.position = position;
            this.positionChanged.fire(position);
        }
        return this;
    }

    onLoad(load: (utils: ItemUtils, stage: this) => (() => void)) {
        this.load = load;
        return this;
    }
}

export default class Quest {

    static questsPerId: Map<string, Quest> | undefined = undefined;
    
    id: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    stages = new Array<Stage>();
    color = Color3.fromRGB(0, 0, 0);
    length = 0;
    level = 0;
    order = 0;
    loaded = false;
    reward: Reward = {}

    constructor(id: string) {
        this.id = id;
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
    
    setColor(color: Color3) {
        this.color = color;
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
}