//!native
//!optimize 2

import { getAllInstanceInfo, isInside, playSoundAtPart } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import { GameAssetService } from "server/services/GameAssetService";
import { LeaderstatsService } from "server/services/LeaderstatsService";
import { OnPlayerJoined } from "server/services/ModdingService";
import { DataService } from "server/services/serverdata/DataService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import Area, { AREAS } from "shared/Area";
import { MUSIC_GROUP } from "shared/constants";
import { getSound } from "shared/GameAssets";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

const GRID_SIZE_UPGRADES = NamedUpgrades.getUpgrades("GridSize");
const AREA_CHECK_PARAMS = new OverlapParams();
AREA_CHECK_PARAMS.CollisionGroup = "PlayerHitbox";

@Service()
export class AreaService implements OnInit, OnPlayerJoined {

    boundingBoxPerArea = new Map<AreaId, [CFrame, Vector3]>();
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
        // grid size save
        const grid = area.getGrid();
        if (grid !== undefined) {
            grid.CollisionGroup = "Item";
            grid.SetAttribute("OriginalSize", grid.Size);
        }

        // area bounds for music prep
        const areaBounds = area.getAreaBounds();
        if (areaBounds !== undefined) {
            const areaSoundGroup = new SoundGroup();
            areaSoundGroup.Name = id;
            areaSoundGroup.Volume = 1;
            areaSoundGroup.Parent = MUSIC_GROUP;
            const loadSound = (sound: Instance) => {
                if (!sound.IsA("Sound"))
                    return;
                sound.SoundGroup = areaSoundGroup;
                sound.SetAttribute("OriginalVolume", sound.Volume);
            };
            areaBounds.GetChildren().forEach((group) => {
                group.Parent = areaSoundGroup;
                loadSound(group);
                for (const child of group.GetChildren())
                    loadSound(child);
            });
            areaBounds.Destroy();
            this.boundingBoxPerArea.set(id, [areaBounds.CFrame, areaBounds.Size]);
        }

        this.loadBoardGui(id, area);
        this.upgradeBoardService.upgradesChanged.connect((data) => {
            if (grid === undefined)
                return;
            let size = grid.GetAttribute("OriginalSize") as Vector3 | undefined;
            if (size === undefined) {
                return;
            }
            GRID_SIZE_UPGRADES.forEach((upgrade, upgradeId) => {
                if (upgrade.area === id)
                    size = upgrade.apply(size!, data.get(upgradeId));
            });
            if (grid.Size !== size) {
                grid.Size = size;
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

        const catchArea = area.getCatchArea();
        if (catchArea !== undefined) {
            catchArea.CanTouch = true;
            catchArea.Touched.Connect((o) => {
                const player = Players.GetPlayerFromCharacter(o.Parent);
                if (player === undefined || player.Character === undefined)
                    return;
                const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
                if (humanoid === undefined)
                    return;
                const rootPart = humanoid.RootPart;
                if (rootPart === undefined)
                    return;
                const spawnLocation = area.getSpawnLocation();
                if (spawnLocation === undefined) {
                    humanoid.TakeDamage(999);
                    return;
                }
                rootPart.CFrame = spawnLocation.CFrame;
                Packets.camShake.fire(player);
                playSoundAtPart(rootPart, getSound("Splash"));
            });
        }
    }

    propagateDropletCountChange(id: AreaId, newCount: number) {
        const dropletCountPerArea = this.gameAssetService.GameUtils.dropletCountPerArea;
        dropletCountPerArea.set(id, newCount);

        if (os.clock() < 4) { // don't propagate changes too early after server start
            return;
        }
        Packets.dropletCountChanged.fireAll(id, newCount);
    }

    loadBoardGui(id: AreaId, area: Area) {
        const dropletCountPerArea = this.gameAssetService.GameUtils.dropletCountPerArea;
        dropletCountPerArea.set(id, 0);
        area.dropletLimit.Changed.Connect(() => this.propagateDropletCountChange(id, dropletCountPerArea.get(id)!));
        DROPLET_STORAGE.ChildAdded.Connect((d) => {
            const info = getAllInstanceInfo(d);
            if (info.Incinerated !== true && info.Area === id) {
                const newCurrent = dropletCountPerArea.get(id)! + 1;
                this.propagateDropletCountChange(id, newCurrent);
                dropletCountPerArea.set(id, newCurrent);

                d.Destroying.Once(() => {
                    const newCurrent = dropletCountPerArea.get(id)! - 1;
                    this.propagateDropletCountChange(id, newCurrent);
                    dropletCountPerArea.set(id, newCurrent);
                });
            }
        });
        // recalibrate in case of external desync
        task.spawn(() => {
            while (task.wait(5)) {
                let i = 0;
                for (const d of DROPLET_STORAGE.GetChildren()) {
                    const info = getAllInstanceInfo(d);
                    if (info.Incinerated !== true && info.Area === id) {
                        ++i;
                    }
                }
                this.propagateDropletCountChange(id, i);
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
        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }
        Packets.tpToArea.onInvoke((player, areaId) => {
            const character = player.Character;
            const area = AREAS[areaId];
            const spawnLocation = area.getSpawnLocation();
            if (character === undefined || area.unlocked.Value === false || spawnLocation === undefined) {
                return false;
            }
            character.PivotTo(spawnLocation.CFrame);
            return true;
        });
    }
}