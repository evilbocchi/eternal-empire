import { Debris, Players, RunService, SoundService, TextChatService, Workspace } from "@rbxts/services";
import { AREAS } from "shared/Area";

declare global {
    type AreaId = keyof (typeof AREAS);
}

/**
 * Whether the current context is the server.
 */
export const IS_SERVER = RunService.IsServer();

/**
 * Whether the game is running in a Continuous Integration (CI) environment.
 * 
 * This is true when physics simulation is not running.
 */
export const IS_CI = !RunService.IsRunning();

/**
 * Whether the game is in Single Server mode.
 */
export const IS_SINGLE_SERVER = game.PlaceId === 17479698702;

/**
 * Creates a folder in the Workspace.
 * 
 * @param name The name of the folder to create.
 * @returns The created folder instance.
 */
function createFolder(name: string) {
    if (IS_SERVER || IS_CI) {
        const folder = new Instance("Folder");
        folder.Name = name;
        folder.Parent = Workspace;
        if (IS_CI) {
            Debris.AddItem(folder, 30); // Automatically clean up the folder after 30 seconds
        }
        return folder;
    }

    return Workspace.FindFirstChild(name)!;
}

export function getChallengeGui() {
    const board = AREAS.SlamoVillage.areaFolder.FindFirstChild("ChallengesBoard");
    if (board === undefined)
        return;
    return board.WaitForChild("SurfaceGui") as ChallengeGui;
}

export function getDisplayName(humanoid: Humanoid) {
    return humanoid.DisplayName === "" ? (humanoid.Parent?.Name ?? "???") : humanoid.DisplayName;
}

export function getMaxXp(currentLevel: number) {
    return math.floor((math.pow(1.1, currentLevel + 25) * 80 - 853) / 10 + 0.5) * 10; // <----- worst garbage ever written
}

export function getNameFromUserId(userId: number | undefined) {
    if (userId === undefined)
        return "Server";
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

export const getNPCModel = (npc: string) => NPC_MODELS.WaitForChild(npc) as Model;
export const getNPCPosition = (npc: string) => getNPCModel(npc).PrimaryPart?.Position;
export const getStartCamera = () => Workspace.FindFirstChild("StartCamera") as Part;
export const getWaypoint = (waypoint: string) => WAYPOINTS.WaitForChild(waypoint) as BasePart;

export const LEADERBOARDS = Workspace.WaitForChild("Leaderboards") as Folder & {
    TimePlayed: Leaderboard;
    Funds: Leaderboard;
    Power: Leaderboard;
    Skill: Leaderboard;
    Donated: Leaderboard & {
        DonationPart: Part & {
            SurfaceGui: SurfaceGui & {
                Display: ScrollingFrame;
            };
        };
    };
};

export const MUSIC_GROUP = SoundService.WaitForChild("Music") as SoundGroup;

export const NAMES_PER_USER_ID = new Map<number, string>();

export const NPC_MODELS = Workspace.WaitForChild("NPCs") as Folder;
export const NPCS = script.Parent?.WaitForChild("npcs") as Folder;

export const PLACED_ITEMS_FOLDER = createFolder("PlacedItems");

/**
 * Returns the folder automatically created containing all the text channels.
 * This is a function to prevent yielding when running tests.
 */
export const getTextChannels = () => TextChatService.WaitForChild("TextChannels", 5) as Folder;

export const WAYPOINTS = Workspace.WaitForChild("Waypoints") as Folder;

export const isStartScreenEnabled = () => (getStartCamera().WaitForChild("StartScreen") as BoolValue).Value;