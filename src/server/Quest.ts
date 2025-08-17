/**
 * @fileoverview Implements the Quest and Stage classes for managing multi-stage quests and quest progression on the server.
 * Handles quest initialization, stage management, NPC/dialogue integration, and quest rewards for the Roblox game.
 * 
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { getNPCModel } from "shared/constants";
import { Server } from "shared/item/ItemUtils";
import { Dialogue } from "shared/NPC";

/**
 * Represents a single stage within a quest, including its description, position, focus, dialogue, and NPCs.
 * Provides methods for configuring stage properties and handling stage events.
 */
export class Stage {
    description: string | undefined;
    position: Vector3 | undefined;
    focus: BasePart | undefined;
    dialogue: Dialogue | undefined;
    npcModel: Model | undefined;
    npcHumanoid: Humanoid | undefined;

    readonly completed = new Signal<() => void>();

    /**
     * Called when the stage is loaded, returning an optional cleanup function.
     */
    load?: ((stage: this) => (() => void));

    positionChanged = new Signal<(position?: Vector3) => void>();

    loadedTimes = 0;
    completedTimes = 0;

    constructor() {
        this.completed.connect(() => {
            if (++this.completedTimes > 1) {
                warn("Stage completed multiple times");
                print(this);
            }
        });
    }

    /**
     * Sets the description for this stage.
     * @param description The stage description.
     * @returns This stage instance.
     */
    setDescription(description: string) {
        this.description = description;
        return this;
    }

    /**
     * Sets the focus instance for this stage, optionally tracking its position.
     * @param instance The instance to focus on.
     * @returns This stage instance.
     */
    setFocus(instance?: Instance) {
        if (instance !== undefined && instance.IsA("BasePart")) {
            this.focus = instance;
            this.setPosition(instance.Position);
            instance.GetPropertyChangedSignal("CFrame").Connect(() => this.setPosition(instance.Position));
        }
        return this;
    }

    /**
     * Sets the NPC for this stage by name, optionally setting it as the focus.
     * @param npcName The name of the NPC.
     * @param setAsFocus Whether to set the NPC as the focus.
     * @returns This stage instance.
     */
    setNPC(npcName: string, setAsFocus?: boolean) {
        this.npcModel = getNPCModel(npcName);
        this.npcHumanoid = this.npcModel.WaitForChild("Humanoid") as Humanoid;
        if (setAsFocus === true)
            return this.setFocus(this.npcHumanoid?.RootPart);
        return this;
    }

    /**
     * Sets the position for this stage and fires the positionChanged signal if changed.
     * @param position The new position.
     * @returns This stage instance.
     */
    setPosition(position?: Vector3) {
        if (this.position !== position) {
            this.position = position;
            this.positionChanged.fire(position);
        }
        return this;
    }

    /**
     * Sets the dialogue for this stage.
     * @param dialogue The dialogue object.
     * @returns This stage instance.
     */
    setDialogue(dialogue: Dialogue) {
        this.dialogue = dialogue;
        return this;
    }

    /**
     * Registers a callback to run when the stage is loaded.
     * 
     * @param load The load callback, returning an optional cleanup function.
     * @returns This stage instance.
     */
    onLoad(load: (stage: this) => (() => void)) {
        this.load = (stage) => {
            if (++this.loadedTimes > 1) {
                warn("Stage loaded multiple times");
                print(stage);
            }

            const callback = load(stage);
            const dialogue = this.dialogue;
            if (dialogue !== undefined) {
                Server.Quest.onStageReached(this, () => {
                    Server.Dialogue.addDialogue(dialogue);
                });
                stage.completed.connect(() => Server.Dialogue.removeDialogue(dialogue));
                return callback;
            }
            return callback;
        };
        return this;
    }

    /**
     * Registers a callback to run when the stage starts, optionally with a load callback.
     * 
     * @param start The start callback, returning an optional cleanup function.
     * @param load Optional load callback.
     * @returns This stage instance.
     */
    onStart(start: (stage: this) => (() => void), load?: (stage: this) => (() => void)) {
        return this.onLoad((stage) => {
            const mainCallback = load === undefined ? undefined : load(stage);
            let callback: () => void;
            Server.Quest.onStageReached(this, () => {
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

/**
 * Represents a multi-stage quest, including its metadata, stages, rewards, and completion dialogue.
 * Provides methods for configuring quest properties, managing stages, and handling quest initialization.
 */
export default class Quest {

    static readonly QUEST_MODULES = function () {
        const moduleScripts = new Map<string, ModuleScript>();
        const folder = script.Parent!.WaitForChild("quests");
        for (const moduleScript of folder.GetDescendants()) {
            if (moduleScript.IsA("ModuleScript") && moduleScript !== script) {
                moduleScripts.set(moduleScript.Name, moduleScript);
            }
        }
        return moduleScripts;
    }();
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

    /**
     * Constructs a new Quest instance.
     * @param id The unique quest identifier.
     */
    constructor(id: string) {
        this.id = id;
        this.color = Quest.colors[string.byte(id)[0] % Quest.colors.size()];
    }

    /**
     * Initializes all quests from the quests folder, caching them by ID.
     * @returns The map of quest IDs to Quest instances.
     */
    static init() {
        const questsPerId = new Map<string, Quest>();
        for (const [_, moduleScript] of this.QUEST_MODULES) {
            const i = require(moduleScript);
            if (i !== undefined) {
                const quest = i as Quest;
                questsPerId.set(quest.id, quest);
            }
        }
        this.questsPerId = questsPerId;
        return this.questsPerId;
    }

    /**
     * Retrieves a quest by its ID.
     * @param questId The quest ID.
     * @returns The Quest instance, or undefined if not found.
     */
    static getQuest(questId: string) {
        return Quest.questsPerId?.get(questId);
    }

    /**
     * Sets the name of the quest.
     * @param name The quest name.
     * @returns This quest instance.
     */
    setName(name: string) {
        this.name = name;
        return this;
    }

    /**
     * Sets the length (number of stages) of the quest.
     * @param length The quest length.
     * @returns This quest instance.
     */
    setLength(length: number) {
        this.length = length;
        return this;
    }

    /**
     * Sets the level requirement for the quest.
     * @param level The required level.
     * @returns This quest instance.
     */
    setLevel(level: number) {
        this.level = level;
        return this;
    }

    /**
     * Sets the order of the quest (for sorting).
     * @param order The quest order.
     * @returns This quest instance.
     */
    setOrder(order: number) {
        this.order = order;
        return this;
    }

    /**
     * Sets the reward for completing the quest.
     * @param reward The reward object.
     * @returns This quest instance.
     */
    setReward(reward: Reward) {
        this.reward = reward;
        return this;
    }

    /**
     * Creates a quest requirement that must be completed before this quest can be started.
     * @param questId The ID of the required quest.
     * @returns This quest instance.
     */
    createQuestRequirement(questId: string) {
        const depModule = Quest.QUEST_MODULES.get(questId);
        if (!depModule) {
            throw `Quest module not found for ID: ${questId}`;
        }
        const depQuest = require(depModule) as Quest;
        if (!depQuest) {
            throw `Quest not found for ID: ${questId}`;
        }
        const stage = new Stage()
            .setDescription(`Complete the quest "${depQuest.name}" before starting this.`)
            .onStart(() => {
                while (Server.Quest.isQuestCompleted(questId) === false) {
                    task.wait(2);
                }
                stage.completed.fire();
                return () => { };
            });
        return this.setStage(1, stage);
    }

    /**
     * Sets a stage at the specified position in the quest.
     * @param number The stage number (1-based).
     * @param stage The Stage instance.
     * @returns This quest instance.
     */
    setStage(number: number, stage: Stage) {
        this.stages.insert(number - 1, stage);
        return this;
    }

    /**
     * Adds a stage to the end of the quest.
     * @param stage The Stage instance.
     * @returns This quest instance.
     */
    addStage(stage: Stage) {
        this.stages.push(stage);
        return this;
    }

    /**
     * Sets the dialogue to be shown upon quest completion.
     * @param dialogue The completion Dialogue.
     * @returns This quest instance.
     */
    setCompletionDialogue(dialogue: Dialogue) {
        this.completionDialogue = dialogue;
        return this;
    }

    /**
     * Registers a callback to run when the quest is initialized.
     * @param callback The callback function.
     * @returns This quest instance.
     */
    onInit(callback: (quest: this) => void) {
        this.initialized.connect(() => callback(this));
        return this;
    }
}