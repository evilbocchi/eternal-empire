import { BaseOnoeNum } from "@antivivi/serikanum";

declare global {
    /**
     * Represents the data structure of an empire profile.
     */
    type EmpireData = typeof EmpireProfileTemplate;
}

/**
 * Default empire profile. Use this to create new empire profiles.
 */
const EmpireProfileTemplate = {
    // General

    /**
     * The name of the empire.
     */
    name: "no name",

    /**
     * The ID of the owner of the empire.
     */
    owner: 0,

    /**
     * The UNIX timestamp when the empire was created.
     */
    created: 0,

    /**
     * The total playtime of the empire in seconds.
     */
    playtime: 0,

    /**
     * The longest session that the empire has had, in seconds.
     */
    longestSession: 0,

    /**
     * The last session that the empire has had in UNIX timestamp.
     */
    lastSession: 0,

    /**
     * The code that can be used to access the reserved server of this empire.
     *
     * @see {@link TeleportService.TeleportToPrivateServer} for using the access code.
     */
    accessCode: "",

    // Management

    /**
     * List of user IDs that have management access (permission level 2) to the empire.
     */
    managers: new Array<number>(),

    /**
     * List of user IDs that have trusted access (permission level 1) to the empire.
     */
    trusted: new Array<number>(),

    /**
     * List of user IDs that have restricted access (permission level -1) to the empire.
     */
    restricted: new Map<number, number>(),

    /**
     * List of user IDs that have banned access (permission level -2) to the empire.
     */
    banned: new Array<number>(),

    /**
     * A list of actions performed by users in the empire.
     */
    logs: new Array<Log>(),

    /**
     * The permission levels for managing the empire.
     */
    permLevels: {
        /** The permission level for managing builds in the empire. */
        build: 0,
        /** The permission level for managing purchases in the empire. */
        purchase: 0,
        /** The permission level for managing resets in the empire. */
        reset: 0,
    },

    /**
     * Whether the empire allows global chat.
     */
    globalChat: true,

    /**
     * Whether the empire allows particle effects.
     */
    particlesEnabled: true,

    /**
     * User IDs that will not be seen in global chat.
     */
    blocking: new Set<number>(),

    // Gameplay

    /**
     * The current empire's level.
     */
    level: 1,

    /**
     * The current experience points of the empire. This value resets after every level up.
     */
    xp: 0,

    /**
     * The current quest stages for the player, where current stage is 0-indexed and -1 means completed.
     *
     * Badly named, should be `currentQuestStages`.
     */
    quests: new Map<string, number>(),

    /**
     * The timestamps when chests were opened.
     */
    openedChests: new Map<string, number>(),

    /**
     * The quantity each upgrade has been applied.
     */
    upgrades: new Map<string, number>(),

    /**
     * A list of events that have been completed.
     */
    completedEvents: new Set<string>(),

    /**
     * The metadata for each quest.
     */
    questMetadata: new Map<string, unknown>(),

    /**
     * The areas that have been unlocked.
     */
    unlockedAreas: new Set<AreaId>(["BarrenIslands"]),

    /**
     * The currencies that the empire has.
     */
    currencies: new Map<Currency, BaseOnoeNum>(),

    /**
     * The highest amount of each currency the empire has ever had.
     */
    mostCurrencies: new Map<Currency, BaseOnoeNum>(),

    /**
     * The highest amount of each currency the empire has ever had since the last reset.
     */
    mostCurrenciesSinceReset: new Map<Currency, BaseOnoeNum>(),

    /**
     * The last reset timestamp.
     */
    lastReset: 0,

    /**
     * The amount of each challenge the empire has completed.
     */
    challenges: new Map<string, number>(),

    /**
     * The ID of the current challenge.
     */
    currentChallenge: undefined as string | undefined,

    /**
     * The start time of the current challenge.
     */
    currentChallengeStartTime: 0,

    /**
     * The fastest time a challenge has been completed.
     */
    challengeBestTimes: new Map<string, number>(),

    /**
     * The items owned by the player.
     */
    items: {
        inventory: new Map<string, number>(),
        bought: new Map<string, number>(),
        worldPlaced: new Map<string, PlacedItem>(),
        nextId: 0,
        uniqueInstances: new Map<string, UniqueItemInstance>(),
    } as ItemsData,

    /** Data that is saved before a challenge starts. */
    backup: {
        currencies: undefined as CurrencyMap | undefined,
        upgrades: undefined as Map<string, number> | undefined,
    },

    /**
     * @deprecated Use {@link printedSetups} instead.
     */
    savedItems: new Map<AreaId, Array<PlacedItem>>(),

    /**
     * A list of setups (arrangement of placed items) that the empire has saved.
     */
    printedSetups: new Array<Setup>(),

    /**
     * The number of times the empire has changed its name.
     */
    nameChanges: 0,

    /**
     * The previous names of the empire.
     */
    previousNames: new Set<string>(),

    /**
     * The current leaderboard positions of this empire.
     * Key is the leaderboard name, value is the position (1 = first place, 2 = second, etc.)
     * Undefined or 0 means not in top 100.
     */
    leaderboardPositions: new Map<string, number>(),

    /**
     * Areas that the player has been to before.
     */
    visitedAreas: new Set<AreaId>(["BarrenIslands"]),
};

export = EmpireProfileTemplate;
