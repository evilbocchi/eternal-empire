import { OnInit, Service } from "@flamework/core";
import { Players, RunService, SoundService } from "@rbxts/services";
import { LeaderstatsService } from "server/services/LeaderstatsService";
import { OnPlayerJoined } from "server/services/PlayerJoinService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import Area from "shared/Area";
import { AREAS, DROPLETS_FOLDER, PLACED_ITEMS_FOLDER, getSound } from "shared/constants";
import NamedUpgrade from "shared/item/NamedUpgrade";
import { Fletchette, RemoteFunc } from "@antivivi/fletchette";
import { isInside } from "shared/utils/vrldk/BasePartUtils";

declare global {
    interface FletchetteCanisters {
        AreaCanister: typeof AreaCanister;
    }
}

const AreaCanister = Fletchette.createCanister("AreaCanister", {
    tpToArea: new RemoteFunc<(area: keyof (typeof AREAS)) => boolean>(),
});

@Service()
export class AreaService implements OnInit, OnPlayerJoined {

    boundingBoxPerArea = new Map<keyof (typeof AREAS), [CFrame, Vector3]>();
    musicGroup = new Instance("SoundGroup");
    constructor(private leaderstatsService: LeaderstatsService, private upgradeBoardService: UpgradeBoardService) {

    }

    getArea(player: Player): keyof (typeof AREAS) {
        return player.GetAttribute("Area") as keyof (typeof AREAS);
    }

    setArea(player: Player, id: keyof (typeof AREAS)) {
        this.leaderstatsService.setLeaderstat(player, "Area", AREAS[id].name);
        player.SetAttribute("Area", id);
    }

    loadArea(id: keyof (typeof AREAS), area: Area) {
        this.loadAreaGroup(id, area);
        this.loadBoardGui(id, area);
        this.upgradeBoardService.upgradesChanged.connect((data) => {
            let size = area.originalGridSize;
            if (size === undefined) {
                return;
            }
            for (const [upgradeId, amount] of pairs(data)) {
                const upgrade = NamedUpgrade.getUpgrade(upgradeId as string);
                if (upgrade === undefined)
                    continue;
                const sizeFormula = upgrade.getGridSizeFormula(id);
                if (sizeFormula !== undefined) {
                    size = sizeFormula(size, amount, upgrade.step);
                }
            }
            if (area.grid !== undefined && area.grid.Size !== size) {
                area.grid.Size = size;
            }
        });
        this.upgradeBoardService.upgradesChanged.fire(this.upgradeBoardService.getAmountPerUpgrade()); // yes this is hacky and no i dont give a shit
        const instances = area.areaFolder.GetChildren();
        for (const instance of instances) {
            if (instance.Name === "Portal") {
                const frame = instance.WaitForChild("Frame") as BasePart;
                const originalPos = frame.Position;
                let debounce = 0;
                const updatePosition = (unlocked: boolean) => frame.Position = unlocked ? originalPos : new Vector3(0, -1000, 0);
                const unlocked = AREAS[(instance.WaitForChild("Destination") as ObjectValue).Value!.Name as keyof (typeof AREAS)].unlocked;
                updatePosition(unlocked.Value);
                unlocked.Changed.Connect((value) => updatePosition(value));
                frame.Touched.Connect((otherPart) => {
                    const character = otherPart.Parent as Model;
                    if (character === undefined)
                        return;
                    const player = Players.GetPlayerFromCharacter(character);
                    if (player === undefined)
                        return;
                    const humanoid = character.FindFirstChildOfClass("Humanoid");
                    if (humanoid === undefined)
                        return;
                    const rootPart = humanoid.RootPart;
                    if (rootPart === undefined || tick() - debounce < 0.2) {
                        return;
                    }
                    (rootPart.FindFirstChild("TeleportSound") as Sound | undefined)?.Play();
                    character.PivotTo((instance.WaitForChild("TpPart") as BasePart).CFrame);
                    debounce = tick();
                    player.SetAttribute("UsedPortal", true);
                });
            }
        }
    }

    loadAreaGroup(id: keyof (typeof AREAS), area: Area) {
        const areaSoundGroup = new Instance("SoundGroup");
        areaSoundGroup.Name = id;
        areaSoundGroup.Volume = 1;
        areaSoundGroup.Parent = this.musicGroup;
        for (const sound of area.areaBounds!.GetDescendants()) {
            if (!sound.IsA("Sound"))
                continue;
            sound.SoundGroup = areaSoundGroup;
            sound.SetAttribute("OriginalVolume", sound.Volume);
        }
        this.boundingBoxPerArea.set(id, [area.areaBounds!.CFrame, area.areaBounds!.Size]);
    }

    loadBoardGui(id: keyof (typeof AREAS), area: Area) {
        const boardGui = area.boardGui;
        const nv = new Instance("IntValue");
        const updateBar = (n: number) => {
            if (boardGui === undefined)
                return;
            const max = area.dropletLimit.Value;
            const perc = n / max;
            boardGui.DropletLimit.Bar.Fill.Size = new UDim2(perc, 0, 1, 0);
            boardGui.DropletLimit.Bar.BarLabel.Text = n + "/" + max;
            boardGui.DropletLimit.Bar.Fill.BackgroundColor3 = perc < 0.5 ? Color3.fromRGB(85, 255, 127) : (perc < 0.75 ? Color3.fromRGB(255, 170, 0) : Color3.fromRGB(255, 0, 0));
        }
        area.dropletLimit.Changed.Connect(() => updateBar(nv.Value));
        nv.Changed.Connect((value) => updateBar(value));
        for (const d of DROPLETS_FOLDER.GetChildren()) {
            if (d.Name === "Droplet" && d.GetAttribute("Area") === id)
                nv.Value += 1;
        }
        DROPLETS_FOLDER.ChildAdded.Connect((d) => {
            if (d.Name === "Droplet" && d.GetAttribute("Area") === id) {
                nv.Value += 1;
                d.Destroying.Once(() => {
                    nv.Value -= 1;
                });
            }
        });
        nv.Name = "DropletCount";
        nv.Parent = area.areaFolder;
        updateBar(nv.Value);

        if (area.grid !== undefined && boardGui !== undefined) {
            const onGridSizeChanged = () => {
                const size = area.grid!.Size;
                boardGui.GridSize.BarLabel.Text = `${size.X}x${size.Z}`;
            }
            onGridSizeChanged();
            area.grid.GetPropertyChangedSignal("Size").Connect(() => onGridSizeChanged);
        }
        let itemCount = 0;
        for (const placed of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (placed.IsA("Model") && placed.GetAttribute("Area") === id) {
                ++itemCount;
            }
        }
        const onItemsChanged = () => {
            if (boardGui === undefined)
                return;
            boardGui.ItemCount.BarLabel.Text = tostring(itemCount);
        }
        onItemsChanged();
        PLACED_ITEMS_FOLDER.ChildAdded.Connect((d) => {
            if (d.IsA("Model") && d.GetAttribute("Area") === id) {
                ++itemCount;
                onItemsChanged();
            }
        });
        PLACED_ITEMS_FOLDER.ChildRemoved.Connect((d) => {
            if (d.IsA("Model") && d.GetAttribute("Area") === id) {
                --itemCount;
                onItemsChanged();
            }
        });

    }

    onPlayerJoined(player: Player) {
        const onCharacterAdded = (() => getSound("Teleport").Clone().Parent = player.Character?.FindFirstChild("HumanoidRootPart"));
        player.CharacterAdded.Connect(() => onCharacterAdded());
        onCharacterAdded();
        RunService.Heartbeat.Connect(() => {
            const character = player.Character;
            if (character === undefined)
                return;
            const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
            if (rootPart === undefined)
                return;
            const position = rootPart.Position;
            for (const [id, [cframe, size]] of this.boundingBoxPerArea) {
                if (isInside(position, cframe, size)) {
                    const cached = this.getArea(player);
                    if (cached !== id) {
                        this.setArea(player, id);
                    }
                    break;
                }
            }
        });
    }

    onInit() {
        this.musicGroup.Name = "Music";
        this.musicGroup.Volume = 0.5;
        this.musicGroup.Parent = SoundService;
        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }
        AreaCanister.tpToArea.onInvoke((player, areaId) => {
            const character = player.Character;
            const area = AREAS[areaId];
            if (character === undefined || area.unlocked.Value === false || area.spawnLocation === undefined) {
                return false;
            }
            character.PivotTo(area.spawnLocation.CFrame);
            return true;
        });
    }
}