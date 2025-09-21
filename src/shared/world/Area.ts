import { getAllInstanceInfo, isInside } from "@antivivi/vrldk";
import { CollectionService, Players, Workspace } from "@rbxts/services";
import { IS_CI, IS_SERVER } from "shared/Context";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import { playSound } from "shared/asset/GameAssets";
import Leaderstats from "shared/data/Leaderstats";
import eat from "shared/hamster/eat";
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

export class GridWorldNode extends SingleWorldNode<Part> {
    originalSize?: Vector3;
    constructor(tag: string) {
        super(tag, (instance) => {
            instance.CollisionGroup = "BuildGrid";
            this.originalSize = instance.Size;
        });
    }
}

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

    /** Optional description of the area. */
    readonly description?: string;

    /** The reference to the folder in the Workspace that contains all area-related parts and models. */
    readonly worldNode: SingleWorldNode;
    /** The reference to the the area's boundary part. */
    readonly areaBoundsWorldNode?: SingleWorldNode<Part>;
    /** The reference to the the area's board part. */
    readonly boardWorldNode?: SingleWorldNode<BasePart>;
    /** The reference to the the area's grid part. */
    readonly gridWorldNode?: GridWorldNode;
    /** The reference to the the area's catch area part. */
    readonly catchAreaWorldNode?: SingleWorldNode<Part>;
    /** The reference to the the area's spawn location part. */
    readonly spawnLocationWorldNode?: SingleWorldNode<SpawnLocation>;

    private readonly boundingBox?: [CFrame, Vector3];

    /** The current number of droplets in this area. Server-side only. */
    dropletCount = 0;
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
     * The lighting configuration for this area.
     * This is a custom Lighting object that can modify the game's lighting settings.
     */
    lightingConfiguration: Partial<Lighting> | undefined;

    /**
     * Creates a new Area instance.
     * @param buildable Whether items can be placed/built in this area
     */
    constructor({
        id,
        name,
        description,
        dropletLimit,
        buildable,
        hidden,
        lightingConfiguration,
    }: {
        id: string;
        name?: string;
        description?: string;
        dropletLimit?: number;
        buildable: boolean;
        hidden?: boolean;
        lightingConfiguration?: Partial<Lighting>;
    }) {
        this.id = id as AreaId;
        this.name = name ?? id;
        this.description = description;
        this.worldNode = new SingleWorldNode(id);
        this.areaBoundsWorldNode = new SingleWorldNode<Part>(`${id}AreaBounds`);
        if (buildable) {
            this.boardWorldNode = new SingleWorldNode<BasePart>(`${id}Board`);
            this.gridWorldNode = new GridWorldNode(`${id}Grid`);
            if (!Sandbox.getEnabled() && !IS_CI) {
                this.buildBounds = BuildBounds.fromArea(this);
            }
        }
        this.catchAreaWorldNode = new SingleWorldNode<Part>(`${id}CatchArea`);
        this.spawnLocationWorldNode = new SingleWorldNode<SpawnLocation>(`${id}SpawnLocation`);
        this.hidden = hidden ?? false;
        this.defaultDropletLimit = dropletLimit;
        this.lightingConfiguration = lightingConfiguration;

        const areaBounds = this.areaBoundsWorldNode.getInstance();
        if (areaBounds !== undefined) {
            this.boundingBox = [areaBounds.CFrame, areaBounds.Size];
        }

        const catchArea = this.catchAreaWorldNode.getInstance();
        if (catchArea !== undefined && IS_SERVER) {
            catchArea.CanTouch = true;
            const connection = catchArea.Touched.Connect((o) => {
                const player = Players.GetPlayerFromCharacter(o.Parent);
                if (player === undefined || player.Character === undefined) return;

                const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
                if (humanoid === undefined) return;

                const rootPart = humanoid.RootPart;
                if (rootPart === undefined) return;

                const spawnLocation = this.spawnLocationWorldNode?.getInstance();
                if (spawnLocation === undefined) {
                    // No safe spawn location - eliminate the player
                    humanoid.TakeDamage(999);
                    return;
                }

                // Teleport player back to safety with effects
                rootPart.CFrame = spawnLocation.CFrame;
                Packets.shakeCamera.toClient(player, "Bump"); // Visual feedback
                playSound("Splash.mp3", rootPart); // Audio feedback
            });
            eat(connection);
        }
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

    private static onPlayerAdded(player: Player) {
        // Continuously monitor player position to detect area changes
        const checkAreaChange = () => {
            task.delay(0.25, checkAreaChange);

            let position: Vector3 | undefined;

            if (IS_CI) {
                position = Workspace.CurrentCamera?.CFrame.Position;
            } else {
                const character = player.Character;
                if (character === undefined) return;

                const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
                if (rootPart === undefined) return;

                position = rootPart.Position;
            }
            if (position === undefined) return;

            // Check against all area bounding boxes to find current area
            for (const [id, area] of pairs(AREAS)) {
                const bounds = area.boundingBox;
                if (bounds === undefined) continue;
                const [cframe, size] = bounds;
                if (isInside(position, cframe, size)) {
                    // Only update if the area has actually changed
                    if (player.GetAttribute("Area") !== id) {
                        player.SetAttribute("Area", id);
                        Leaderstats.setLeaderstat(player, "Area", area.name);
                    }
                    break; // Found the area, no need to check others
                }
            }
        };
        task.spawn(checkAreaChange);
    }

    private propagateDropletCountChange() {
        // Prevent network spam during server initialization
        if (os.clock() < 10) {
            return;
        }
        // Broadcast the change to all connected clients
        Packets.dropletCountChanged.toAllClients(this.id, this.dropletCount, this.getDropletLimit());
    }

    static {
        if (IS_SERVER || IS_CI) {
            // Set up player area tracking when players join
            const playerAddedConnection = Players.PlayerAdded.Connect((player) => {
                this.onPlayerAdded(player);
            });
            for (const player of Players.GetPlayers()) {
                this.onPlayerAdded(player);
            }

            const addedConnection = CollectionService.GetInstanceAddedSignal("Droplet").Connect((instance) => {
                const info = getAllInstanceInfo(instance);
                if (info.Incinerated) return;
                const areaId = info.Area;
                if (areaId === undefined) return;
                const area = AREAS[areaId];
                if (area === undefined) return;
                area.dropletCount++;
                area.propagateDropletCountChange();
                instance.Destroying.Once(() => {
                    area.dropletCount = math.max(0, area.dropletCount - 1);
                    area.propagateDropletCountChange();
                });
            });

            eat(() => {
                playerAddedConnection.Disconnect();
                addedConnection.Disconnect();
            });
        }
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
        description: "An unstable region that holds the bridge to Slamo Village.",
        dropletLimit: 1,
        buildable: true,
        hidden: false,
    }),
    AbandonedRig: new Area({
        id: "AbandonedRig",
        name: "Abandoned Rig",
        description:
            "A famous mining company used to harvest resources in the suburbs of Slamo Village. Nobody is coming back.",
        dropletLimit: 15,
        buildable: true,
        hidden: false,
    }),
    DespairPlantation: new Area({
        id: "DespairPlantation",
        name: "Despair Plantation",
        description: "Where the vilest of Obbyists are banished to.",
        dropletLimit: 75,
        buildable: true,
        hidden: false,
    }),
    Eden: new Area({
        id: "Eden",
        name: "Eden",
        description: "Welcome home.",
        dropletLimit: 5,
        buildable: true,
        hidden: false,
    }),

    // Primary areas
    BarrenIslands: new Area({
        id: "BarrenIslands",
        name: "Barren Islands",
        description:
            "An abandoned region inhabited by only the most unfortunate. Desolate and devoid of resources, the only beacon of hope shining upon this forbidden wasteland is the beginning of a capitalistic empire.",
        dropletLimit: 75,
        buildable: true,
        hidden: false,
    }),
    SlamoVillage: new Area({
        id: "SlamoVillage",
        name: "Slamo Village",
        description:
            "A humble settlement built by the Slamos, where time itself seems to slow. Peace has reigned for decades, untouched by conflict or ambition.",
        dropletLimit: 40,
        buildable: true,
        hidden: false,
    }),
    SkyPavilion: new Area({
        id: "SkyPavilion",
        name: "Sky Pavilion",
        description:
            "When the world below grew dangerous, Noobs looked up and found salvation in the sky. Built atop a floating landmass no one fully understands, the Sky Pavilion rose as a fortified sanctuary of sleek architecture and modern ambition. Its citizens live in comfort and denial, trusting the ground beneath their feet… even if no one remembers why it stays in the air.",
        dropletLimit: 20,
        buildable: true,
        hidden: false,
    }),
};
