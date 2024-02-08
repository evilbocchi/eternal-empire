import BuildBounds from "shared/utils/BuildBounds";

type ServerBoardGui = SurfaceGui & {
    DropletLimit: Frame & {
        Bar: Frame & {
            Fill: Frame;
            BarLabel: TextLabel
        }
    }
}

type ClientBoardGui = SurfaceGui & {
    AllowedItems: Frame & {
        ItemList: ScrollingFrame
    }
}


class Area {
    areaFolder: Folder;
    name: string;
    dropletLimit: IntValue;
    grid: BasePart;
    catchArea: BasePart;
    buildBounds: BuildBounds;
    areaBounds: BasePart;
    spawnLocation: SpawnLocation;
    islandInfoBoard: Model;
    serverBoardGui: ServerBoardGui;
    clientBoardGui: ClientBoardGui;

    constructor(areaFolder: Instance) {
        if (!areaFolder.IsA("Folder")) {
            error(areaFolder.Name + " is not a folder");
        }
        this.areaFolder = areaFolder;
        this.name = (areaFolder.WaitForChild("Name") as StringValue).Value;
        this.spawnLocation = areaFolder.WaitForChild("SpawnLocation") as SpawnLocation;
        this.dropletLimit = areaFolder.WaitForChild("DropletLimit") as IntValue;
        this.dropletLimit.SetAttribute("Default", this.dropletLimit.Value);
        this.grid = areaFolder.WaitForChild("Grid") as BasePart;
        this.catchArea = areaFolder.WaitForChild("CatchArea") as BasePart;
        this.buildBounds = new BuildBounds(this.grid);
        this.areaBounds = areaFolder.WaitForChild("AreaBounds") as BasePart;
        this.areaBounds.Transparency = 1;
        this.islandInfoBoard = areaFolder.WaitForChild("IslandInfoBoard") as Model;
        const serverGui = this.islandInfoBoard.WaitForChild("ServerGuiPart").FindFirstChildOfClass("SurfaceGui");
        if (serverGui === undefined)
            error("No server GUI found in GuiPart for area " + this.name);
        this.serverBoardGui = serverGui as ServerBoardGui;
        const clientGui = this.islandInfoBoard.WaitForChild("ClientGuiPart").FindFirstChildOfClass("SurfaceGui");
        if (clientGui === undefined)
            error("No client GUI found in GuiPart for area " + this.name);
        this.clientBoardGui = clientGui as ClientBoardGui;
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

    getBuildBounds() {
        return this.buildBounds;
    }
}

export = Area;