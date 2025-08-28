import Signal from "@antivivi/lemon-signal";

/**
 * Global quest state manager to bridge between QuestsController and React components.
 * This maintains the single source of truth for quest tracking state.
 */
class QuestStateManager {
    private trackedQuest: string | undefined = undefined;
    public readonly trackedQuestChanged = new Signal<(quest: string | undefined) => void>();

    getTrackedQuest(): string | undefined {
        return this.trackedQuest;
    }

    setTrackedQuest(questId: string | undefined) {
        if (this.trackedQuest !== questId) {
            this.trackedQuest = questId;
            this.trackedQuestChanged.fire(questId);
        }
    }
}

// Export singleton instance
export const questState = new QuestStateManager();