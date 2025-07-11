import BuildBounds from "shared/utils/BuildBounds";

type BoardGui = SurfaceGui & {
    DropletLimit: Frame & {
        Bar: Frame & {
            Fill: Frame;
            BarLabel: TextLabel
        }
    },
    GridSize: Frame & {
        BarLabel: TextLabel;
    },
    ItemCount: Frame & {
        BarLabel: TextLabel;
    }
}

class Area {
    areaFolder: Folder;
    name: string;
    dropletLimit: IntValue;
    grid: BasePart | undefined;
    originalGridSize: Vector3 | undefined;
    catchArea: BasePart | undefined;
    buildBounds: BuildBounds | undefined;
    areaBounds: BasePart;
    spawnLocation: SpawnLocation | undefined;
    islandInfoBoard: Model | undefined;
    boardGui: BoardGui | undefined;
    unlocked: BoolValue;
    lightingConfiguration: Lighting | undefined;

    constructor(areaFolder: Instance, buildable: boolean) {
        if (!areaFolder.IsA("Folder")) {
            error(areaFolder.Name + " is not a folder");
        }
        this.areaFolder = areaFolder;
        this.name = (areaFolder.WaitForChild("Name") as StringValue).Value;
        this.spawnLocation = (buildable ? areaFolder.WaitForChild("SpawnLocation") : areaFolder.FindFirstChild("SpawnLocation")) as SpawnLocation | undefined;
        this.dropletLimit = areaFolder.WaitForChild("DropletLimit") as IntValue;
        this.dropletLimit.SetAttribute("Default", this.dropletLimit.Value);
        this.grid = (buildable ? areaFolder.WaitForChild("Grid") : areaFolder.FindFirstChild("Grid")) as BasePart | undefined;
        this.originalGridSize = this.grid?.Size;
        this.catchArea = (buildable ? areaFolder.WaitForChild("CatchArea") : areaFolder.FindFirstChild("CatchArea")) as BasePart | undefined;
        if (this.grid !== undefined) {
            this.buildBounds = new BuildBounds(this.grid);
        }
        this.areaBounds = areaFolder.WaitForChild("AreaBounds") as BasePart;
        this.areaBounds.Transparency = 1;
        this.islandInfoBoard = (buildable ? areaFolder.WaitForChild("IslandInfoBoard") : areaFolder.FindFirstChild("IslandInfoBoard")) as Model | undefined;
        this.boardGui = this.islandInfoBoard?.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui") as BoardGui | undefined;
        this.unlocked = areaFolder.WaitForChild("Unlocked") as BoolValue;
        const lightingConfigModule = areaFolder.FindFirstChild("LightingConfiguration");
        if (lightingConfigModule !== undefined) {
            this.lightingConfiguration = require(lightingConfigModule as ModuleScript) as Lighting;
        }
        task.spawn(() => {
            while (task.wait()) {
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

export = Area;