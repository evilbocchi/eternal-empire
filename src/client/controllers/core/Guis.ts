import { PLAYER_GUI } from "client/constants";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";

const setParent = (instance: Instance) => {
    instance.Parent = PLAYER_GUI;
    if (IS_EDIT) {
        eat(instance);
    }
};

const createScreenGui = (name: string, displayOrder = 0, ignoreGuiInset = true): ScreenGui => {
    const screenGui = new Instance("ScreenGui");
    screenGui.IgnoreGuiInset = ignoreGuiInset;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Name = name;
    screenGui.DisplayOrder = displayOrder;
    setParent(screenGui);
    return screenGui;
};

export const HAMSTER_GUI = createScreenGui("Hamster", 10);
export const START_GUI = createScreenGui("Start", 20);
export const INTRO_GUI = createScreenGui("Intro", 30);
export const MAIN_LAYOUT_GUI = createScreenGui("MainLayout", -1);
export const PLAYERLIST_GUI = createScreenGui("PlayerList", 15);
export const EFFECTS_GUI = createScreenGui("Effects", 2);
export const TOOLTIPS_GUI = createScreenGui("Tooltips", 3);
export const TOASTS_GUI = createScreenGui("Toasts", 40);
export const DIALOGUE_GUI = createScreenGui("Dialogue", 1);
export const BALANCE_GUI = createScreenGui("Balance", -1);
export const CURRENCY_GAIN_GUI = createScreenGui("CurrencyGain", -1, false);
export const BUILD_GUI = createScreenGui("Build");
export const SETTINGS_GUI = createScreenGui("Settings");
export const INVENTORY_GUI = createScreenGui("Inventory");
export const LOGS_GUI = createScreenGui("Logs");
export const QUESTS_GUI = createScreenGui("Quests");
export const BACKPACK_GUI = createScreenGui("Backpack", -1);
export const STATS_GUI = createScreenGui("Stats");
export const PURCHASE_GUI = createScreenGui("Purchase", 0, false);
export const LEVELUP_GUI = createScreenGui("LevelUp", -1);
export const QUESTCOMPLETION_GUI = createScreenGui("QuestCompletion", -1);
export const CHALLENGECOMPLETION_GUI = createScreenGui("ChallengeCompletion", -1);
export const CHESTLOOT_GUI = createScreenGui("ChestLoot", -1);
export const CHALLENGE_GUI = createScreenGui("Challenge");
export const CHALLENGE_HUD_GUI = createScreenGui("ChallengeHud", -1);
export const UPGRADEBOARD_GUI = (() => {
    const folder = new Instance("Folder");
    folder.Name = "UpgradeBoard";
    setParent(folder);
    return folder;
})();
export const PRINTER_GUI = (() => {
    const folder = new Instance("Folder");
    folder.Name = "Printer";
    setParent(folder);
    return folder;
})();
export const SHOP_GUI = (() => {
    const folder = new Instance("Folder");
    folder.Name = "Shop";
    setParent(folder);
    return folder;
})();
export const WORLD_GUI = (() => {
    const folder = new Instance("Folder");
    folder.Name = "World";
    setParent(folder);
    return folder;
})();
