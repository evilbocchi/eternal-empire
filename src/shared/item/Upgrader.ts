import { RunService } from "@rbxts/services";
import { DROPLETS_FOLDER } from "shared/constants";
import Conveyor from "shared/item/Conveyor";
import { GameUtils } from "shared/utils/ItemUtils";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

declare global {
    interface ItemTypes {
        Upgrader: Upgrader;
    }

    interface UpgradeInfo {
        Upgrader: Model,
        UpgraderId: string,
        EmptyUpgrade?: boolean;
    }

    interface InstanceInfo {
        LaserId?: string;
        Enabled?: boolean;
        WasEnabled?: boolean;
        Upgrades?: Map<string, UpgradeInfo>;
        CheckTouch?: (droplet: BasePart) => void;
        ParentInfo?: InstanceInfo;
        OriginalTransparency?: number;
        CurrentTransparency?: number;
        Sky?: boolean;
    }
}

class Upgrader extends Conveyor {

    sky?: boolean;
    isStacks?: boolean;

    static readonly SPAWNED_LASERS = new Map<BasePart, InstanceInfo>();

    static hookLaser(model: Model, item: Upgrader, laser: BasePart, upgradedEvent: BindableEvent, deco?: (upgrade: UpgradeInfo) => void) {
        const modelInfo = GameUtils.getAllInstanceInfo(model);
        const laserInfo = GameUtils.getAllInstanceInfo(laser);
        const laserId = item.isStacks === false ? item.id : model.Name + laserInfo.LaserId;
        const dropletTouched = (droplet: BasePart) => {
            if (droplet.Parent !== DROPLETS_FOLDER || GameUtils.getInstanceInfo(droplet, "Incinerated") === true)
                return;
            const instanceInfo = GameUtils.getAllInstanceInfo(droplet);

            if (item.sky === true)
                instanceInfo.Sky = true;
            let upgrades = instanceInfo.Upgrades;
            if (upgrades === undefined)
                upgrades = new Map();
            else if (upgrades.has(laserId) || modelInfo.Maintained === false || laserInfo.Enabled === false)
                return;

            const upgrade: UpgradeInfo = {
                Upgrader: model,
                UpgraderId: item.id,
            };
            if (deco !== undefined)
                deco(upgrade);
            upgrades.set(laserId, upgrade);
            instanceInfo.Upgrades = upgrades;
            upgradedEvent.Fire(droplet);
        };
        laserInfo.CheckTouch = dropletTouched;
        laserInfo.ParentInfo = modelInfo;
        laserInfo.OriginalTransparency = laser.Transparency;
        laser.Touched.Connect((droplet) => dropletTouched(droplet));
        this.SPAWNED_LASERS.set(laser, laserInfo);
        model.Destroying.Once(() => this.SPAWNED_LASERS.delete(laser));
    }

    static load(model: Model, item: Upgrader) {
        const upgradedEvent = new Instance("BindableEvent");
        const lasers = findBaseParts(model, "Laser");
        let i = 0;
        for (const laser of lasers) {
            GameUtils.setInstanceInfo(laser, "LaserId", tostring(i));
            Upgrader.hookLaser(model, item, laser, upgradedEvent);
            i++;
        }
        item.maintain(model);
        upgradedEvent.Name = "UpgradedEvent";
        upgradedEvent.Parent = model;
    }

    constructor(id: string) {
        super(id);
        this.types.add("Upgrader");
        this.onLoad((model) => Upgrader.load(model, this));
    }

    setSky(sky: boolean) {
        this.sky = sky;
        return this;
    }

    stacks(isStacks: boolean) {
        this.isStacks = isStacks;
        return this;
    }

    static {
        const connection = RunService.Heartbeat.Connect(() => {
            for (const [laser, info] of this.SPAWNED_LASERS) {
                if (info.WasEnabled !== info.Enabled) {
                    info.WasEnabled = info.Enabled;
                    if (info.WasEnabled === true) {
                        laser.GetTouchingParts().forEach((droplet) => info.CheckTouch!(droplet));
                    }
                }
                const toSet = info.ParentInfo!.Maintained === true ? info.OriginalTransparency! : 1;
                if (info.CurrentTransparency !== toSet) {
                    info.CurrentTransparency = toSet;
                    laser.Transparency = toSet;
                }
            }
        });
    }
}

export = Upgrader;