/**
 * @fileoverview Implements the Quest and Stage classes for managing multi-stage quests and quest progression on the server.
 * Handles quest initialization, stage management, NPC/dialogue integration, and quest rewards for the Roblox game.
 * 
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { ReplicatedStorage } from "@rbxts/services";
import type QuestService from "server/services/serverdata/QuestService";
import { getNPCModel } from "shared/constants";
import { Server } from "shared/item/ItemUtils";
import { Dialogue } from "shared/NPC";

/**
 * Represents a single stage within a quest, including its description, position, focus, dialogue, and NPCs.
 * Provides methods for configuring stage properties and handling stage events.
 */
export class Stage {
    /** The description of the stage. */
    description: string | undefined;

    /** The position players are guided to when focusing on this stage. */
    position: Vector3 | undefined;

    /** The part players are guided to when focusing on this stage. */
    focus: BasePart | undefined;

    /** The dialogue added when this stage is reached. This is handled by {@link QuestService}. */
    dialogue: Dialogue | undefined;

    /** The NPC model associated with this stage. */
    npcModel: Model | undefined;

    /** The humanoid associated with the NPC model. */
    npcHumanoid: Humanoid | undefined;

    private positionChangedCallback?: (position: Vector3 | undefined) => void;
    private reachedCallback?: ((stage: this) => (() => void));
    private completedCallback?: ((stage: this) => void);

    private reachedTimes = 0;
    private completedTimes = 0;
    safe = true;

    constructor() {

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
    setNPC(npcName: NPCName, setAsFocus?: boolean) {
        [this.npcModel, this.npcHumanoid] = getNPCModel(npcName);
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
            this.positionChangedCallback?.(position);
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
     * Registers a callback to run when the stage is reached.
     * 
     * @param reached The reached callback, returning an optional cleanup function.
     * @returns This stage instance.
     */
    onReached(reached: (stage: this) => (() => void)) {
        this.reachedCallback = reached;
        return this;
    }

    /**
     * Registers a callback to run when the stage is completed.
     * 
     * @param complete The complete callback.
     * @returns This stage instance.
     */
    onComplete(complete: (stage: this) => void) {
        this.completedCallback = complete;
        return this;
    }

    /**
     * Registers a callback to run when the stage position changes.
     * 
     * @param callback The position changed callback.
     * @returns This stage instance.
     */
    onPositionChanged(callback: (position: Vector3 | undefined) => void) {
        this.positionChangedCallback = callback;
        return this;
    }

    /**
     * Triggers the stage reached event.
     */
    reach() {
        if (++this.reachedTimes > 1) {
            warn("Stage reached multiple times");
            print(this);
            if (this.safe) { // Prevent further processing
                return;
            }
            print("Unsafe mode enabled, allowing multiple reaches");
        }
        return this.reachedCallback?.(this);
    }

    /**
     * Completes the stage, firing the completed signal.
     */
    complete() {
        if (++this.completedTimes > 1) {
            warn("Stage completed multiple times");
            print(this);
            if (this.safe) { // Prevent further processing
                return;
            }
            print("Unsafe mode enabled, allowing multiple completions");
        }
        this.completedCallback?.(this);
    }

    /**
     * Unloads the stage and its resources.
     */
    unload() {
        this.completedCallback = undefined;
        this.reachedCallback = undefined;
        this.positionChangedCallback = undefined;
        table.clear(this);
    }
}

/**
 * Represents a multi-stage quest, including its metadata, stages, rewards, and completion dialogue.
 * Provides methods for configuring quest properties, managing stages, and handling quest initialization.
 */
export default class Quest {

    static readonly QUEST_MODULES = new Map<string, ModuleScript>();
    static readonly QUEST_PER_ID = new Map<string, Quest>();
    private static readonly toClean = new Set<RBXScriptConnection>();

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
     * Reloads the quest modules from the quests folder.
     * 
     * This clones the module scripts into the QUEST_MODULES map,
     * allowing for hot reloading of quest modules.
     */
    private static reloadQuestModules() {
        this.QUEST_MODULES.clear();
        const folder = script.Parent!.WaitForChild("quests");
        for (const moduleScript of folder.GetDescendants()) {
            if (moduleScript.IsA("ModuleScript") && moduleScript !== script) {
                this.QUEST_MODULES.set(moduleScript.Name, moduleScript.Clone());
            }
        }
    }

    /**
     * Loads all quest modules and initializes quest data.
     * 
     * @returns A map of quest IDs to their quest info.
     */
    static load() {
        this.reloadQuestModules();
        this.QUEST_PER_ID.clear();
        for (const cleanup of this.toClean) {
            cleanup.Disconnect();
        }
        for (const [_, moduleScript] of this.QUEST_MODULES) {
            const i = require(moduleScript);
            if (i !== undefined) {
                const quest = i as Quest;
                this.QUEST_PER_ID.set(quest.id, quest);
            }
        }

        const questInfos = new Map<string, QuestInfo>();

        // Process all quests and create client info
        this.QUEST_PER_ID.forEach((quest, questId) => {
            quest.initialized.fire();

            const questInfo: QuestInfo = {
                name: quest.name ?? questId,
                colorR: quest.color.R,
                colorG: quest.color.G,
                colorB: quest.color.B,
                level: quest.level,
                length: quest.length,
                reward: quest.reward,
                order: quest.order,
                stages: [],
            };

            // Set up stage position tracking
            quest.stages.forEach((stage, index) => {
                function onPositionChanged(position?: Vector3) {
                    return ReplicatedStorage.SetAttribute(`${questId}${index}`, position);
                }
                onPositionChanged(stage.position);
                stage.onPositionChanged(onPositionChanged);
                questInfo.stages.push({ description: stage.description! });
            });

            questInfos.set(questId, questInfo);
        });

        return questInfos;
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
            .onReached(() => {
                while (Server.Quest.isQuestCompleted(questId) === false) {
                    task.wait(2);
                }
                stage.complete();
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

    /**
     * Unloads the quest and its stages.
     */
    unload() {
        this.stages.forEach((stage) => {
            stage.unload();
        });
        table.clear(this);
    }
}