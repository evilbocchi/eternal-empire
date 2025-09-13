import { PLAYER_GUI } from "client/constants";

const createScreenGui = (name: string, displayOrder = 0): ScreenGui => {
    const screenGui = new Instance("ScreenGui");
    screenGui.IgnoreGuiInset = true;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Name = name;
    screenGui.DisplayOrder = displayOrder;
    screenGui.Parent = PLAYER_GUI;
    return screenGui;
};

export const MAIN_LAYOUT_GUI = createScreenGui("MainLayout");
export const CLICK_SPARKS_GUI = createScreenGui("ClickSparks", 1);
export const TOOLTIPS_GUI = createScreenGui("Tooltips", 2);
export const BALANCE_GUI = createScreenGui("Balance");
export const BUILD_GUI = createScreenGui("BuildManager");
export const SETTINGS_GUI = createScreenGui("Settings");
export const INVENTORY_GUI = createScreenGui("Inventory");
export const LOGS_GUI = createScreenGui("Logs");
export const QUESTS_GUI = createScreenGui("Quests");
export const BACKPACK_GUI = createScreenGui("Backpack");
export const STATS_GUI = createScreenGui("Stats");
