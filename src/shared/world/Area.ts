import { RunService } from "@rbxts/services";
import { IS_CI } from "shared/Context";
import Sandbox from "shared/Sandbox";
import BuildBounds from "shared/placement/BuildBounds";
import { SingleWorldNode } from "shared/world/nodes/WorldNode";

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
        };
        GridSize: Frame & {
            BarLabel: TextLabel;
        };
        ItemCount: Frame & {
            BarLabel: TextLabel;
        };
    };

    /** Unique identifier for an area */
    type AreaId = keyof typeof AREAS;
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
        const globalDropletLimit = new Instance("IntValue");
        globalDropletLimit.Name = "GlobalDropletLimit";
        globalDropletLimit.Value = 500;
        return globalDropletLimit;
    })();

    /**
     * Global flag indicating if areas are unlocked by default.
     * Created as a BoolValue for game-wide tracking.
     */
    static readonly globalUnlocked = (function () {
        const globalUnlocked = new Instance("BoolValue");
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
    readonly name: string;

    /**
     * The reference to the folder in the Workspace that contains all area-related parts and models.
     */
    readonly worldNode: SingleWorldNode;

    /**
     * The maximum number of droplets allowed in this area.
     */
    readonly defaultDropletLimit?: number;

    private readonly dropletLimitBoosts = new Map<string, number>();

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
     * @deprecated TODO
     */
    areaFolder: Folder;

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
     */
    lightingConfiguration: Partial<Lighting> | undefined;

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
        return this.areaFolder.FindFirstChild("BuildGrid") as BasePart | undefined;
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
     * @param buildable Whether items can be placed/built in this area
     */
    constructor({
        id,
        name,
        dropletLimit,
        buildable,
        hidden,
        lightingConfiguration,
    }: {
        id: string;
        name?: string;
        dropletLimit?: number;
        buildable: boolean;
        hidden?: boolean;
        lightingConfiguration?: Partial<Lighting>;
    }) {
        this.id = id as AreaId;
        this.name = name ?? id;
        this.worldNode = new SingleWorldNode(id);
        this.hidden = hidden ?? false;
        this.defaultDropletLimit = dropletLimit;
        this.lightingConfiguration = lightingConfiguration;

        this.areaFolder = this.worldNode.waitForInstance() as Folder;

        // Skip further initialization in sandbox mode
        if (Sandbox.getEnabled() || IS_CI) {
            return this;
        }

        this.buildBounds = BuildBounds.fromArea(this);
    }

    boostDropletLimit(source: string, amount?: number) {
        if (amount === undefined) {
            this.dropletLimitBoosts.delete(source);
            return;
        }
        this.dropletLimitBoosts.set(source, amount);
    }

    getDropletLimit() {
        let limit = this.defaultDropletLimit ?? 0;
        for (const [, boost] of this.dropletLimitBoosts) {
            limit += boost;
        }
        return limit;
    }
}

/**
 * Collection of all game areas.
 * Provides easy access to all areas for other systems.
 */
export const AREAS = {
    // Intermediate areas
    ToxicWaterfall: new Area({
        id: "ToxicWaterfall",
        name: "Toxic Waterfall",
        buildable: false,
        hidden: true,
    }),
    MagicalHideout: new Area({
        id: "MagicalHideout",
        name: "Magical Hideout",
        buildable: false,
        hidden: true,
    }),
    SecretLab: new Area({
        id: "SecretLab",
        name: "Secret Laboratory",
        buildable: false,
        hidden: true,
        lightingConfiguration: {
            Ambient: Color3.fromRGB(31, 31, 31),
            OutdoorAmbient: Color3.fromRGB(0, 0, 0),
            EnvironmentDiffuseScale: 0,
            EnvironmentSpecularScale: 0,
            FogEnd: 70,
            FogStart: 20,
            FogColor: Color3.fromRGB(0, 0, 0),
            Brightness: 0,
        },
    }),

    // Secondary areas
    IntermittentIsles: new Area({
        id: "IntermittentIsles",
        name: "Intermittent Isles",
        dropletLimit: 1,
        buildable: true,
        hidden: false,
    }),
    AbandonedRig: new Area({
        id: "AbandonedRig",
        name: "Abandoned Rig",
        dropletLimit: 15,
        buildable: true,
        hidden: false,
    }),
    DespairPlantation: new Area({
        id: "DespairPlantation",
        name: "Despair Plantation",
        dropletLimit: 75,
        buildable: true,
        hidden: false,
    }),
    Eden: new Area({
        id: "Eden",
        name: "Eden",
        dropletLimit: 5,
        buildable: true,
        hidden: false,
    }),

    // Primary areas
    BarrenIslands: new Area({
        id: "BarrenIslands",
        name: "Barren Islands",
        dropletLimit: 75,
        buildable: true,
        hidden: false,
    }),
    SlamoVillage: new Area({
        id: "SlamoVillage",
        name: "Slamo Village",
        dropletLimit: 40,
        buildable: true,
        hidden: false,
    }),
    SkyPavilion: new Area({
        id: "SkyPavilion",
        name: "Sky Pavilion",
        dropletLimit: 20,
        buildable: true,
        hidden: false,
    }),
};
