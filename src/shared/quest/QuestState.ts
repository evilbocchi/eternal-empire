import Signal from "@antivivi/lemon-signal";

/**
 * Global quest state manager to bridge between QuestsController and React components.
 * This maintains the single source of truth for quest tracking state.
 */
class QuestStateManager {
    private _trackedQuest: string | undefined = undefined;
    public readonly trackedQuestChanged = new Signal<(quest: string | undefined) => void>();

    get trackedQuest(): string | undefined {
        return this._trackedQuest;
    }

    set trackedQuest(questId: string | undefined) {
        if (this._trackedQuest !== questId) {
            this._trackedQuest = questId;
            this.trackedQuestChanged.fire(questId);
        }
    }

    setTrackedQuest(questId: string | undefined) {
        this.trackedQuest = questId;
    }
}

// Export singleton instance
export const questState = new QuestStateManager();