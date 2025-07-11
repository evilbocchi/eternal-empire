import { RunService } from "@rbxts/services";
import BuildBounds from "shared/utils/BuildBounds";

declare global {
    type Bar = Frame & {
        UIStroke: UIStroke;
        Fill: Frame;
        BarLabel: TextLabel;
    }
    type BoardGui = SurfaceGui & {
        DropletLimit: Frame & {
            Bar: Bar
        },
        GridSize: Frame & {
            BarLabel: TextLabel;
        },
        ItemCount: Frame & {
            BarLabel: TextLabel;
        }
    }
}

class Area {
    readonly areaFolder: Folder;
    readonly id: AreaId;
    readonly name: string;
    readonly map: Folder;
    readonly dropletLimit: IntValue;
    readonly grid: BasePart | undefined;
    readonly originalGridSize: Vector3 | undefined;
    readonly catchArea: BasePart | undefined;
    readonly buildBounds: BuildBounds | undefined;
    readonly unlocked: BoolValue;
    readonly hidden: boolean;
    areaBounds?: BasePart;
    spawnLocation: SpawnLocation | undefined;
    islandInfoBoard: Model | undefined;
    boardGui: BoardGui | undefined;
    lightingConfiguration: Lighting | undefined;

    constructor(areaFolder: Instance, buildable: boolean) {
        if (!areaFolder.IsA("Folder")) {
            error(areaFolder.Name + " is not a folder");
        }
        this.areaFolder = areaFolder;
        this.id = areaFolder.Name as AreaId;
        this.name = (areaFolder.WaitForChild("Name") as StringValue).Value;
        this.map = areaFolder.WaitForChild("Map") as Folder;
        this.spawnLocation = (buildable ? areaFolder.WaitForChild("SpawnLocation") : areaFolder.FindFirstChild("SpawnLocation")) as SpawnLocation | undefined;
        this.dropletLimit = areaFolder.WaitForChild("DropletLimit") as IntValue;
        this.dropletLimit.SetAttribute("Default", this.dropletLimit.Value);
        this.grid = (buildable ? areaFolder.WaitForChild("Grid") : areaFolder.FindFirstChild("Grid")) as BasePart | undefined;
        this.originalGridSize = this.grid?.Size;
        this.catchArea = (buildable ? areaFolder.WaitForChild("CatchArea") : areaFolder.FindFirstChild("CatchArea")) as BasePart | undefined;
        if (this.grid !== undefined) {
            this.buildBounds = new BuildBounds(this.grid);
        }
        this.areaBounds = areaFolder.FindFirstChild("AreaBounds") as BasePart | undefined;
        if (this.areaBounds !== undefined)
            this.areaBounds.Transparency = 1;
        
        this.islandInfoBoard = (buildable ? areaFolder.WaitForChild("IslandInfoBoard") : areaFolder.FindFirstChild("IslandInfoBoard")) as Model | undefined;
        this.boardGui = this.islandInfoBoard?.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui") as BoardGui | undefined;
        this.unlocked = areaFolder.WaitForChild("Unlocked") as BoolValue;
        this.hidden = (areaFolder.FindFirstChild("Hidden") as BoolValue | undefined)?.Value === true;
        const lightingConfigModule = areaFolder.FindFirstChild("LightingConfiguration");
        if (lightingConfigModule !== undefined) {
            this.lightingConfiguration = require(lightingConfigModule as ModuleScript) as Lighting;
        }
        if (RunService.IsServer()) {
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

export = Area;