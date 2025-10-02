declare global {
    /**
     * Client-side settings for the player.
     */
    type Settings = typeof PlayerProfileTemplate.settings;
}

/**
 * Default player profile. Use this to create new player profiles.
 */
const PlayerProfileTemplate = {
    /**
     * List of empire IDs that this player has access to.
     * @deprecated Use DataStore-based available empires instead.
     */
    availableEmpires: undefined as Array<string> | undefined,

    /**
     * List of empire IDs that this player owns.
     */
    ownedEmpires: new Array<string>(),

    /**
     * Player's client-side settings and preferences.
     */
    settings: {
        /**
         * Whether the player wants to use scientific notation for large numbers.
         */
        ScientificNotation: false,

        /**
         * Hotkeys for various actions.
         */
        hotkeys: {} as { [key: string]: number },

        /**
         * Whether the player wants to see the cutscene when a reset is performed.
         */
        ResetAnimation: true,

        /**
         * Whether the player wants to see tweens that animate item placements.
         */
        BuildAnimation: true,

        /**
         * Whether the player wants to see UI animations when currency gains are made.
         */
        CurrencyGainAnimation: true,

        /**
         * Whether the player wants currencies to be formatted in their respective formats.
         */
        FormatCurrencies: true,

        /**
         * Whether the player wants to hear music in the game.
         */
        Music: true,

        /**
         * Whether the player wants to hear sound effects in the game.
         */
        SoundEffects: true,

        /**
         * Whether the player does not want to see items that are maxed out in the shop.
         */
        HideMaxedItems: false,

        /**
         * Whether the player wants the camera to focus on shops when they open.
         */
        FocusShopCamera: false,

        /**
         * Whether the player wants to see item shadows in the world.
         */
        ItemShadows: true,

        /**
         * Whether the player wants to see particle effects.
         */
        Particles: true,

        /**
         * Whether the player wants to see visual rain effects.
         */
        VisualRain: true,
    },

    /**
     * Raw number of purifier clicks the player has made.
     */
    rawPurifierClicks: 0,

    /**
     * Amount the player has donated (in Robux).
     */
    donated: 0,
};

export = PlayerProfileTemplate;
