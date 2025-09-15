import { Players, SoundService, TextChatService, Workspace } from "@rbxts/services";
import { Workspace_Waypoints } from "services";
import { AREAS } from "shared/world/Area";

export function getChallengeGui() {
    const board = AREAS.SlamoVillage.areaFolder.FindFirstChild("ChallengesBoard");
    if (board === undefined) return;
    return board.WaitForChild("SurfaceGui") as ChallengeGui;
}

export function getDisplayName(humanoid: Humanoid) {
    return humanoid.DisplayName === "" ? (humanoid.Parent?.Name ?? "???") : humanoid.DisplayName;
}

/**
 * Calculates the XP needed to reach the next level based on the current level.
 * @see https://www.desmos.com/calculator/sqm2qsz4en for the formula graph
 * @param currentLevel The player's current level.
 * @returns The maximum XP required to reach the next level.
 */
export function getMaxXp(currentLevel: number) {
    return math.floor((math.pow(1.1, currentLevel + 25) * 80 - 853) / 10 + 0.5) * 10;
}

export function getNameFromUserId(userId: number | undefined) {
    if (userId === undefined) return "Server";
    const name = NAMES_PER_USER_ID.get(userId);
    if (name !== undefined) {
        return name;
    }
    const [success, value] = pcall(() => Players.GetNameFromUserIdAsync(userId));
    if (!success) {
        return "no name";
    }
    NAMES_PER_USER_ID.set(userId, value);
    return value;
}

export const getStartCamera = () => Workspace.FindFirstChild("StartCamera") as Part;

export const LEADERBOARDS = Workspace.WaitForChild("Leaderboards") as Folder & {
    TimePlayed: Model;
    Level: Model;
    Funds: Model;
    Power: Model;
    Skill: Model;
    Donated: Model & {
        DonationPart: Part & {
            SurfaceGui: SurfaceGui & {
                Display: ScrollingFrame;
            };
        };
    };
};

export const MUSIC_GROUP = SoundService.WaitForChild("Music") as SoundGroup;

export const NAMES_PER_USER_ID = new Map<number, string>();

export const NPCS = script.Parent?.WaitForChild("npcs") as Folder;

export const PLACED_ITEMS_FOLDER = Workspace.WaitForChild("PlacedItems") as Folder;

/**
 * Returns the folder automatically created containing all the text channels.
 * This is a function to prevent yielding when running tests.
 */
export const getTextChannels = () => TextChatService.WaitForChild("TextChannels", 5) as Folder;

export const WAYPOINTS = Workspace.WaitForChild("Waypoints") as Workspace_Waypoints;

export const isStartScreenEnabled = () => (getStartCamera().WaitForChild("StartScreen") as BoolValue).Value;
