import { Debris, Players, SoundService, TextChatService, Workspace } from "@rbxts/services";
import { Workspace_Waypoints } from "services";
import { AREAS } from "shared/Area";
import { IS_CI } from "shared/Context";

declare global {
    type AreaId = keyof typeof AREAS;
}

const CAMERA = Workspace.WaitForChild("Camera") as Camera;
/**
 * Creates a folder in the Workspace.
 *
 * @param name The name of the folder to create.
 * @returns The created folder instance.
 */
function createFolder(name: string, parent: Instance = Workspace) {
    const cached = parent.FindFirstChild(name)!;
    if (cached !== undefined) {
        return cached;
    }

    const folder = new Instance("Folder");
    folder.Name = name;
    folder.Parent = parent;
    if (IS_CI) {
        Debris.AddItem(folder, 30); // Automatically clean up the folder after 30 seconds
    }
    return folder;
}

export function getChallengeGui() {
    const board = AREAS.SlamoVillage.areaFolder.FindFirstChild("ChallengesBoard");
    if (board === undefined) return;
    return board.WaitForChild("SurfaceGui") as ChallengeGui;
}

export function getDisplayName(humanoid: Humanoid) {
    return humanoid.DisplayName === "" ? (humanoid.Parent?.Name ?? "???") : humanoid.DisplayName;
}

export function getMaxXp(currentLevel: number) {
    return math.floor((math.pow(1.1, currentLevel + 25) * 80 - 853) / 10 + 0.5) * 10; // <----- worst garbage ever written
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

export const getNPCModel = (npc: NPCName): LuaTuple<[Model, Humanoid, BasePart]> => {
    const model = NPC_MODELS.WaitForChild(npc) as Model;
    const humanoid = model.WaitForChild("Humanoid") as Humanoid;
    const rootPart = humanoid.RootPart!;
    return $tuple(model, humanoid, rootPart);
};
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

export const NPC_MODELS = Workspace.WaitForChild("NPCs") as Folder;
export const NPCS = script.Parent?.WaitForChild("npcs") as Folder;

export const PLACED_ITEMS_FOLDER = createFolder("PlacedItems");

/**
 * Returns the folder automatically created containing all the text channels.
 * This is a function to prevent yielding when running tests.
 */
export const getTextChannels = () => TextChatService.WaitForChild("TextChannels", 5) as Folder;

export const WAYPOINTS = Workspace.WaitForChild("Waypoints") as Workspace_Waypoints;

export const isStartScreenEnabled = () => (getStartCamera().WaitForChild("StartScreen") as BoolValue).Value;
