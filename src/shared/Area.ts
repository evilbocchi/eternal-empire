import { RunService, Workspace } from "@rbxts/services";
import Sandbox from "shared/Sandbox";
import BuildBounds from "shared/placement/BuildBounds";

declare global {
    type Bar = Frame & {
        UIStroke: UIStroke;
        Fill: Frame;
        BarLabel: TextLabel;
    };
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

const IS_SERVER = RunService.IsServer();

/**
 * Represents an area in the game.
 * May contain a grid where items can be placed.
 */
export default class Area {

    static readonly globalDropletLimit = (function () {
        const globalDropletLimit = new IntValue();
        globalDropletLimit.Name = "GlobalDropletLimit";
        globalDropletLimit.Value = 500;
        return globalDropletLimit;
    })();

    static readonly globalUnlocked = (function () {
        const globalUnlocked = new BoolValue();
        globalUnlocked.Name = "GlobalUnlocked";
        globalUnlocked.Value = false;
        return globalUnlocked;
    })();

    readonly id: AreaId;
    readonly name = "" as string;
    readonly map = Workspace as Instance;
    readonly dropletLimit = Area.globalDropletLimit;
    readonly unlocked = Area.globalUnlocked;
    readonly hidden = false as boolean;
    readonly buildBounds: BuildBounds | undefined;

    islandInfoBoard: Model | undefined;
    boardGui: BoardGui | undefined;
    lightingConfiguration: Lighting | undefined;

    /**
     * The {@link SpawnLocation} of the area. Players will teleport here when using teleporters.
     */
    getSpawnLocation() {
        return this.areaFolder.FindFirstChild("SpawnLocation") as SpawnLocation | undefined;
    }

    /**
     * The {@link BasePart} that defines the region in which items can be placed.
     */
    getGrid() {
        return this.areaFolder.FindFirstChild("Grid") as BasePart | undefined;
    }

    /**
     * The {@link BasePart} that defines the region in which characters have fallen off the map.
     */
    getCatchArea() {
        return this.areaFolder.FindFirstChild("CatchArea") as BasePart | undefined;
    }

    /**
     * The {@link BasePart} that defines the region in which the area is in.
     */
    getAreaBounds() {
        return this.areaFolder.FindFirstChild("AreaBounds") as BasePart | undefined;
    }

    constructor(public readonly areaFolder: Instance, buildable: boolean) {
        if (!areaFolder.IsA("Folder")) {
            error(areaFolder.Name + " is not a folder.");
        }
        this.id = areaFolder.Name as AreaId;

        if (Sandbox.getEnabled())
            return;

        this.name = (areaFolder.WaitForChild("Name") as StringValue).Value;
        this.map = areaFolder.WaitForChild("Map") as Folder;
        this.dropletLimit = areaFolder.WaitForChild("DropletLimit") as IntValue;
        this.dropletLimit.SetAttribute("Default", this.dropletLimit.Value);
        this.buildBounds = BuildBounds.fromArea(this);

        this.islandInfoBoard = (buildable ? areaFolder.WaitForChild("IslandInfoBoard") : areaFolder.FindFirstChild("IslandInfoBoard")) as Model | undefined;
        this.boardGui = this.islandInfoBoard?.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui") as BoardGui | undefined;
        this.unlocked = areaFolder.WaitForChild("Unlocked") as BoolValue;
        this.hidden = (areaFolder.FindFirstChild("Hidden") as BoolValue | undefined)?.Value === true;

        const lightingConfigModule = areaFolder.FindFirstChild("LightingConfiguration");
        if (lightingConfigModule !== undefined) {
            this.lightingConfiguration = require(lightingConfigModule as ModuleScript) as Lighting;
        }

        if (IS_SERVER) {
            task.spawn(() => {
                while (task.wait(1)) {
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

function createArea(name: string, isUnlocked: boolean) {
    if (Sandbox.getEnabled() && IS_SERVER) {
        const folder = new Folder();
        folder.Name = name;
        folder.Parent = Workspace;
        return new Area(folder, isUnlocked);
    }
    return new Area(Workspace.WaitForChild(name), isUnlocked);
}

export const AREAS = {
    BarrenIslands: createArea("BarrenIslands", true),
    MagicalHideout: createArea("MagicalHideout", false),
    SecretLab: createArea("SecretLab", false),
    SkyPavilion: createArea("SkyPavilion", true),
    SlamoVillage: createArea("SlamoVillage", true),
    ToxicWaterfall: createArea("ToxicWaterfall", false),
};