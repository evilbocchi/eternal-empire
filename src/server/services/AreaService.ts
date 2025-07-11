import { OnInit, Service } from "@flamework/core";
import { Players, RunService, SoundService, Workspace } from "@rbxts/services";
import { GameAssetService } from "server/services/GameAssetService";
import { LeaderstatsService } from "server/services/LeaderstatsService";
import { OnPlayerJoined } from "server/services/ModdingService";
import { DataService } from "server/services/serverdata/DataService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import Area from "shared/Area";
import { AREAS, DROPLETS_FOLDER, getSound } from "shared/constants";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/network/Packets";
import { isInside } from "shared/utils/vrldk/BasePartUtils";

const GRID_SIZE_UPGRADES = NamedUpgrades.getUpgrades("GridSize");
const AREA_CHECK_PARAMS = new OverlapParams();
AREA_CHECK_PARAMS.CollisionGroup = "PlayerHitbox";

@Service()
export class AreaService implements OnInit, OnPlayerJoined {

    boundingBoxPerArea = new Map<AreaId, [CFrame, Vector3]>();
    musicGroup = new Instance("SoundGroup");
    constructor(private dataService: DataService, private leaderstatsService: LeaderstatsService, private upgradeBoardService: UpgradeBoardService, private gameAssetService: GameAssetService) {

    }

    getArea(player: Player): AreaId {
        return player.GetAttribute("Area") as AreaId;
    }

    setArea(player: Player, id: AreaId) {
        this.leaderstatsService.setLeaderstat(player, "Area", AREAS[id].name);
        player.SetAttribute("Area", id);
    }

    loadArea(id: AreaId, area: Area) {
        this.loadAreaGroup(id, area);
        this.loadBoardGui(id, area);
        this.upgradeBoardService.upgradesChanged.connect((data) => {
            let size = area.originalGridSize;
            if (size === undefined) {
                return;
            }
            GRID_SIZE_UPGRADES.forEach((upgrade, upgradeId) => {
                if (upgrade.area === id)
                    size = upgrade.apply(size!, data.get(upgradeId));
            });
            if (area.grid !== undefined && area.grid.Size !== size) {
                area.grid.Size = size;
            }
        });
        this.upgradeBoardService.upgradesChanged.fire(this.dataService.empireData.upgrades); // yes this is hacky and no i dont give a shit
        const instances = area.areaFolder.GetChildren();
        for (const instance of instances) {
            if (instance.Name === "Portal") {
                const frame = instance.WaitForChild("Frame") as BasePart;
                const originalPos = frame.Position;
                let debounce = 0;
                const updatePosition = (unlocked: boolean) => frame.Position = unlocked ? originalPos : new Vector3(0, -1000, 0);
                const unlocked = AREAS[(instance.WaitForChild("Destination") as ObjectValue).Value!.Name as AreaId].unlocked;
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

    loadAreaGroup(id: AreaId, area: Area) {
        const areaSoundGroup = new Instance("SoundGroup");
        areaSoundGroup.Name = id;
        areaSoundGroup.Volume = 1;
        areaSoundGroup.Parent = this.musicGroup;
        const areaBounds = area.areaBounds!;
        areaBounds.CanTouch = false;
        areaBounds.CanQuery = false;
        areaBounds.GetDescendants().forEach((sound) => {
            if (!sound.IsA("Sound"))
                return;
            sound.SoundGroup = areaSoundGroup;
            sound.SetAttribute("OriginalVolume", sound.Volume);
        });
        this.boundingBoxPerArea.set(id, [areaBounds.CFrame, areaBounds.Size]);
    }

    loadBoardGui(id: AreaId, area: Area) {
        const dropletCountPerArea = this.gameAssetService.GameUtils.dropletCountPerArea;
        dropletCountPerArea.set(id, 0);
        area.dropletLimit.Changed.Connect(() => Packets.dropletCountChanged.fireAll(id, dropletCountPerArea.get(id)!));
        DROPLETS_FOLDER.ChildAdded.Connect((d) => {
            const info = this.gameAssetService.GameUtils.getAllInstanceInfo(d);
            if (info.Incinerated !== true && info.Area === id) {
                const newCurrent = dropletCountPerArea.get(id)! + 1;
                Packets.dropletCountChanged.fireAll(id, newCurrent);
                dropletCountPerArea.set(id, newCurrent);

                d.Destroying.Once(() => {
                    const newCurrent = dropletCountPerArea.get(id)! - 1;
                    Packets.dropletCountChanged.fireAll(id, newCurrent);
                    dropletCountPerArea.set(id, newCurrent);
                });
            }
        });
        // recalibrate
        task.spawn(() => {
            while (task.wait(5)) {
                const droplets = DROPLETS_FOLDER.GetChildren();
                let i = 0;
                for (const d of droplets) {
                    const info = this.gameAssetService.GameUtils.getAllInstanceInfo(d);
                    if (info.Incinerated !== true && info.Area === id) {
                        ++i;
                    }
                }
                dropletCountPerArea.set(id, i);
                Packets.dropletCountChanged.fireAll(id, i);
            }
        });
    }

    onPlayerJoined(player: Player) {
        const onCharacterAdded = (character: Model | undefined) => {
            if (character === undefined)
                return;

            const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

            for (const part of character.GetChildren()) {
                if (part.IsA("BasePart"))
                    part.CollisionGroup = part === rootPart ? "PlayerHitbox" : "Player";
            }

            getSound("Teleport").Clone().Parent = rootPart;
        };
        player.CharacterAdded.Connect((character) => onCharacterAdded(character));
        onCharacterAdded(player.Character);
        task.spawn(() => {
            while (task.wait(0.1)) {
                const character = player.Character;
                if (character === undefined)
                    continue;
                const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
                if (rootPart === undefined)
                    continue;
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
        Packets.tpToArea.onInvoke((player, areaId) => {
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