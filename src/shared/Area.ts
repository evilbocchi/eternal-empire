import { RunService, Workspace } from "@rbxts/services";
import Sandbox from "shared/Sandbox";
import BuildBounds from "shared/placement/BuildBounds";

declare global {
    /**
     * Represents a progress bar UI element with fill, stroke, and label components.
     */
    type Bar = Frame & {
        UIStroke: UIStroke;
        Fill: Frame & {
            UIStroke: UIStroke;
        };
        BarLabel: TextLabel;
    };

    /**
     * Represents the information board GUI for an area.
     * Contains UI elements for displaying droplet limits, grid size, and item counts.
     */
    type BoardGui = SurfaceGui & {
        DropletLimit: Frame & {
            Bar: Bar;
        },
        GridSize: Frame & {
            BarLabel: TextLabel;
        },
        ItemCount: Frame & {
            BarLabel: TextLabel;
        };
    };
}

// Determine if the code is running on the server or client
const IS_SERVER = RunService.IsServer();

/**
 * Represents an area in the game.
 * Areas are regions that can contain grids where items can be placed,
 * have specific spawn locations, boundaries, and other properties.
 */
export default class Area {

    /**
     * The global limit for droplets across all areas.
     * Created as an IntValue for game-wide tracking.
     */
    static readonly globalDropletLimit = (function () {
        const globalDropletLimit = new IntValue();
        globalDropletLimit.Name = "GlobalDropletLimit";
        globalDropletLimit.Value = 500;
        return globalDropletLimit;
    })();

    /**
     * Global flag indicating if areas are unlocked by default.
     * Created as a BoolValue for game-wide tracking.
     */
    static readonly globalUnlocked = (function () {
        const globalUnlocked = new BoolValue();
        globalUnlocked.Name = "GlobalUnlocked";
        globalUnlocked.Value = false;
        return globalUnlocked;
    })();

    /**
     * Unique identifier for this area.
     */
    readonly id: AreaId;

    /**
     * The display name of the area.
     * This is used for UI elements and identification.
     */

    readonly name = "" as string;
    /**
     * The map instance representing the area in the game world.
     * This is where all the area-specific models and parts are located.
     */
    readonly map = Workspace as Instance;

    /**
     * The droplet limit for this area.
     * This is an IntValue that can be modified by game mechanics.
     * It represents the maximum number of droplets that can exist in this area.
     */
    readonly dropletLimit = Area.globalDropletLimit;

    /**
     * Whether this area has been reached by the player.
     * This is a BoolValue that indicates if the area is accessible.
     */
    readonly unlocked = Area.globalUnlocked;

    /**
     * Whether this area will show in item descriptions and other UI elements.
     */
    readonly hidden = false as boolean;

    /**
     * The boundaries for building in this area.
     */
    readonly buildBounds: BuildBounds | undefined;

    // UI and visual components

    /**
     * The physical board model in the game world.
     * This is a Model that contains the visual representation of the area board.
     */
    islandInfoBoard: Model | undefined;

    /**
     * The GUI displayed on the island info board.
     * This is a SurfaceGui that contains UI elements for displaying area information.
     */
    boardGui: BoardGui | undefined;

    /**
     * The lighting configuration for this area.
     * This is a custom Lighting object that can modify the game's lighting settings.
     * It is loaded from a ModuleScript in the area folder if available.
     */
    lightingConfiguration: Lighting | undefined;

    /**
     * Returns the spawn location for this area.
     * Players will teleport here when using teleporters to visit the area.
     * 
     * @returns The SpawnLocation instance or undefined if none exists
     */
    getSpawnLocation() {
        return this.areaFolder.FindFirstChild("SpawnLocation") as SpawnLocation | undefined;
    }

    /**
     * Returns the grid part that defines where items can be placed.
     * The grid is a BasePart that marks the buildable region.
     * 
     * @returns The Grid BasePart or undefined if none exists
     */
    getGrid() {
        return this.areaFolder.FindFirstChild("Grid") as BasePart | undefined;
    }

    /**
     * Returns the part that defines where characters have fallen off the map.
     * When characters touch this part, they're considered to have fallen out of bounds.
     * 
     * @returns The CatchArea BasePart or undefined if none exists
     */
    getCatchArea() {
        return this.areaFolder.FindFirstChild("CatchArea") as BasePart | undefined;
    }

    /**
     * Returns the part that defines the region containing the area.
     * Used for determining when a player is within the area's boundaries.
     * 
     * @returns The AreaBounds BasePart or undefined if none exists
     */
    getAreaBounds() {
        return this.areaFolder.FindFirstChild("AreaBounds") as BasePart | undefined;
    }

    /**
     * Creates a new Area instance.
     * 
     * @param areaFolder The folder containing all area components and configuration
     * @param buildable Whether items can be placed/built in this area
     */
    constructor(public readonly areaFolder: Instance, buildable: boolean) {
        if (!areaFolder.IsA("Folder")) {
            error(areaFolder.Name + " is not a folder.");
        }
        this.id = areaFolder.Name as AreaId;

        // Skip further initialization in sandbox mode
        if (Sandbox.getEnabled())
            return;

        // Initialize area properties from children in the area folder
        this.name = (areaFolder.WaitForChild("Name") as StringValue).Value;
        this.map = areaFolder.WaitForChild("Map") as Folder;
        this.dropletLimit = areaFolder.WaitForChild("DropletLimit") as IntValue;
        this.dropletLimit.SetAttribute("Default", this.dropletLimit.Value);
        this.buildBounds = BuildBounds.fromArea(this);

        // Initialize UI components if they exist
        this.islandInfoBoard = (buildable ? areaFolder.WaitForChild("IslandInfoBoard") : areaFolder.FindFirstChild("IslandInfoBoard")) as Model | undefined;
        this.boardGui = this.islandInfoBoard?.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui") as BoardGui | undefined;
        this.unlocked = areaFolder.WaitForChild("Unlocked") as BoolValue;
        this.hidden = (areaFolder.FindFirstChild("Hidden") as BoolValue | undefined)?.Value === true;

        // Load custom lighting configuration if available
        const lightingConfigModule = areaFolder.FindFirstChild("LightingConfiguration");
        if (lightingConfigModule !== undefined) {
            this.lightingConfiguration = require(lightingConfigModule as ModuleScript) as Lighting;
        }

        // Server-side droplet limit update loop
        if (IS_SERVER) {
            task.spawn(() => {
                while (task.wait(1)) {
                    // Calculate the total droplet limit by adding up all modifiers
                    let limit = this.dropletLimit.GetAttribute("Default") as number;
                    for (const a of this.dropletLimit.GetChildren()) {
                        if (a.IsA("IntValue")) {
                            limit += a.Value;
                        }
                    }
                    this.dropletLimit.Value = limit;
                }
            });
        }
    }
}

/**
 * Helper function to create an Area instance.
 * Uses different initialization strategies depending on whether sandbox mode is enabled.
 * 
 * @param name Name of the area folder in Workspace
 * @param isUnlocked Whether the area should start unlocked
 * @returns A new Area instance
 */
function createArea(name: string, isUnlocked: boolean) {
    if (Sandbox.getEnabled() && IS_SERVER) {
        // In sandbox mode on the server, create a new folder
        const folder = new Folder();
        folder.Name = name;
        folder.Parent = Workspace;
        return new Area(folder, isUnlocked);
    }
    // Otherwise use existing folder from Workspace
    return new Area(Workspace.WaitForChild(name), isUnlocked);
}

/**
 * Collection of all game areas.
 * Provides easy access to all areas for other systems.
 * The boolean in createArea represents whether the area starts unlocked.
 */
export const AREAS = {
    BarrenIslands: createArea("BarrenIslands", true),
    MagicalHideout: createArea("MagicalHideout", false),
    SecretLab: createArea("SecretLab", false),
    SlamoVillage: createArea("SlamoVillage", true),
    ToxicWaterfall: createArea("ToxicWaterfall", false),

    SkyPavilion: createArea("SkyPavilion", true),
    Eden: createArea("Eden", false),
};