import { StarterGui } from "@rbxts/services";
import { PLAYER_GUI } from "client/constants";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";

const setParent = (instance: Instance) => {
    if (IS_EDIT) {
        instance.Parent = StarterGui;
        eat(instance);
    } else {
        instance.Parent = PLAYER_GUI;
    }
};

const createScreenGui = (name: string, displayOrder = 0): ScreenGui => {
    const screenGui = new Instance("ScreenGui");
    screenGui.IgnoreGuiInset = true;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Name = name;
    screenGui.DisplayOrder = displayOrder;
    setParent(screenGui);
    return screenGui;
};

export const HAMSTER_GUI = createScreenGui("Hamster", 10);
export const MAIN_LAYOUT_GUI = createScreenGui("MainLayout");
export const CLICK_SPARKS_GUI = createScreenGui("ClickSparks", 2);
export const TOOLTIPS_GUI = createScreenGui("Tooltips", 3);
export const DIALOGUE_GUI = createScreenGui("Dialogue", 1);
export const BALANCE_GUI = createScreenGui("Balance");
export const BUILD_GUI = createScreenGui("BuildManager");
export const SETTINGS_GUI = createScreenGui("Settings");
export const INVENTORY_GUI = createScreenGui("Inventory");
export const LOGS_GUI = createScreenGui("Logs");
export const QUESTS_GUI = createScreenGui("Quests");
export const BACKPACK_GUI = createScreenGui("Backpack");
export const STATS_GUI = createScreenGui("Stats");
export const PURCHASE_GUI = createScreenGui("Purchase");
export const LEVELUP_GUI = createScreenGui("LevelUp", 5);
export const QUESTCOMPLETION_GUI = createScreenGui("QuestCompletion", 6);
export const CHALLENGE_GUI = createScreenGui("Challenge", 7);
export const CHALLENGE_HUD_GUI = createScreenGui("ChallengeHud", 4);
export const SHOP_GUI = (() => {
    const folder = new Instance("Folder");
    folder.Name = "ShopGui";
    setParent(folder);
    return folder;
})();
export const WORLD_GUI = (() => {
    const folder = new Instance("Folder");
    folder.Name = "WorldGuis";
    setParent(folder);
    return folder;
})();
