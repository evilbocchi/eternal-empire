import { RunService, TweenService } from "@rbxts/services";
import Item from "shared/item/Item";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import { GameUtils, getPlacedItemsInArea } from "shared/utils/ItemUtils";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";


declare global {
    interface ItemTypes {
        Clickable: Special.Manumatic.Clickable;
        Clicker: Special.Manumatic.Clicker;
        Damager: Special.Killbrick.Damager;
        OmniUpgrader: Special.OmniUpgrader;
    }
    interface UpgradeInfo {
        Omni?: string;
    }
}

namespace Special {
    export namespace LaserFan {
        export function load(model: Model, item: Item, speed?: number) {
            const motor = model.WaitForChild("Motor") as Model;
            const bp = weldModel(motor);
            const o = bp.CFrame;
            let v = 0;
            const ItemsService = GameUtils.itemsService;
            let d = ItemsService.getPlacedItem(model.Name)?.direction === true;
            const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear);
            item.repeat(model, () => {
                v += (d ? 1 : -1) * (speed ?? 3);
                TweenService.Create(bp, tweenInfo, { CFrame: o.mul(CFrame.Angles(math.rad(v), 0, 0)) }).Play();
            }, 0.1);
            (bp.FindFirstChild("ProximityPrompt") as ProximityPrompt | undefined)?.Triggered.Connect(() => {
                d = !d;
                const pi = ItemsService.getPlacedItem(model.Name);
                if (pi === undefined) {
                    return;
                }
                pi.direction = d;
            });
        }
    }

    export namespace HandCrank {
        export function load(model: Model, callback: (timeSinceCrank: number) => void) {
            let t = 0;
            const crank = model.WaitForChild("Crank") as Model;
            const v = new Instance("IntValue");
            const bp = weldModel(crank);
            const o = bp.CFrame;
            v.Value = 0;
            v.Parent = crank;
            const c1 = RunService.Heartbeat.Connect(() => {
                bp.CFrame = o.mul(CFrame.Angles(0, 0, math.rad(v.Value)));
                callback(tick() - t);
            });
            const sound = crank.FindFirstChildOfClass("Sound");
            const pp = bp.FindFirstChildOfClass("ProximityPrompt");
            if (pp === undefined || sound === undefined)
                return;
            let tween: Tween | undefined = undefined;
            pp.Triggered.Connect(() => {
                if (tick() - t > 1) {
                    t = tick();
                    sound.Play();
                    if (tween === undefined || tween.PlaybackState === Enum.PlaybackState.Completed) {
                        v.Value = 0;
                        tween = TweenService.Create(v, new TweenInfo(1), { Value: 360 });
                        tween.Play();
                    }
                }
            });
            model.Destroying.Once(() => c1.Disconnect());
        }
    }

    export namespace PowerHarvester {
        export function spin(model: Model) {
            const cube = model.WaitForChild("Cube") as BasePart;
            let connection: RBXScriptConnection | undefined = undefined;
            const createRandoomTween = () => {
                const tween = TweenService.Create(cube, new TweenInfo(2, Enum.EasingStyle.Linear), { Orientation: new Vector3(math.random(0, 360), math.random(0, 360), math.random(0, 360)) });
                connection = tween.Completed.Once(() => createRandoomTween());
                tween.Play();
            };
            createRandoomTween();
            model.Destroying.Once(() => connection?.Disconnect());
            return cube;
        }
    }

    export namespace DropletSlayer {
        export function noob(model: Model, item: Item, cd: number) {
            const laser = model.WaitForChild("Laser") as BasePart;
            const laserInfo = GameUtils.getAllInstanceInfo(laser);
            laserInfo.Enabled = false;
            const activeEvent = new Instance("UnreliableRemoteEvent");
            activeEvent.Name = "ActiveEvent";
            activeEvent.Parent = model;
            item.repeat(model, () => {
                activeEvent.FireAllClients();
                laserInfo.Enabled = true;
                task.delay(0.5, () => laserInfo.Enabled = false);
            }, cd);
        }
        export function noobClient(model: Model) {
            const noob = model.WaitForChild("Noob") as Model;
            const humanoid = noob.WaitForChild("Humanoid") as Humanoid;
            const animation = loadAnimation(humanoid, 16920778613);
            const laser = model.WaitForChild("Laser") as BasePart;
            const slash = model.WaitForChild("Slash") as BasePart;
            slash.Transparency = 1;
            const sound = laser.WaitForChild("Sound") as Sound;
            const slashOriginalCFrame = slash.CFrame;
            const activeEvent = model.WaitForChild("ActiveEvent") as UnreliableRemoteEvent;
            activeEvent.OnClientEvent.Connect(() => {
                slash.Transparency = 0.011;
                slash.CFrame = slashOriginalCFrame;
                TweenService.Create(slash, new TweenInfo(0.3), { CFrame: slashOriginalCFrame.mul(CFrame.Angles(0, math.rad(180), 0)), Transparency: 1 }).Play();
                animation?.Play();
                sound.Play();
            });
        }
    }

    export namespace Killbrick {
        export interface Damager {
            setDamage(damage: number): ThisType<Damager>;
        }

        export class KillbrickUpgrader extends Upgrader implements Damager {
            damage = 0;

            constructor(id: string) {
                super(id);
                this.types.add("Damager");
                this.onLoad((model) => (model.WaitForChild("UpgradedEvent") as BindableEvent).Event.Connect((droplet: Instance) => {
                    const health = GameUtils.getInstanceInfo(droplet, "Health") as number | undefined;
                    if (health === undefined) {
                        return;
                    }
                    GameUtils.setInstanceInfo(droplet, "Health", health - this.damage);
                }));
            }

            setDamage(damage: number) {
                this.damage = damage;
                return this;
            }
        }
    }

    export namespace Manumatic {
        export interface Clickable {
            setDebounce(debounce: number): ThisType<Clickable>;
            setOnClick(onClick: (model: Model, item: Item) => void): ThisType<Clickable>;
        }

        export class ManumaticUpgrader extends Upgrader implements Clickable {
            debounce = 0.1;
            onClick: ((model: Model, item: Item, player: Player | undefined, value: number) => void) | undefined;

            constructor(id: string) {
                super(id);
                this.types.add("Clickable");
                this.onLoad((model, item) => {
                    const clickDetector = new Instance("ClickDetector");
                    let last = 0;
                    const click = (player: Player | undefined, value: number) => {
                        const onClick = this.onClick;
                        if (onClick !== undefined) {
                            onClick(model, item, player, value);
                        }
                    };
                    clickDetector.MouseClick.Connect((player) => {
                        const now = tick();
                        if (now - last < this.debounce) {
                            return;
                        }
                        click(player, 1);
                        last = now;
                    });
                    clickDetector.Parent = model.WaitForChild("ClickArea");
                    const event = new Instance("BindableEvent");
                    event.Name = "Click";
                    event.Event.Connect((clickValue: number) => click(undefined, clickValue));
                    event.Parent = model;
                });
            }

            setDebounce(debounce: number) {
                this.debounce = debounce;
                return this;
            }

            setOnClick(onClick: (model: Model, item: Item, player: Player | undefined, value: number) => void) {
                this.onClick = onClick;
                return this;
            }
        }

        export class Clicker extends Item {

            cps: number | undefined = undefined;
            clickValue = 1;
            onClick: ((model: Model, item: Item) => void) | undefined = undefined;

            static createClickRemote(model: Model) {
                const clickEvent = new Instance("UnreliableRemoteEvent");
                clickEvent.Name = "ClickEvent";
                clickEvent.Parent = model;
                return clickEvent;
            }

            constructor(id: string) {
                super(id);
                this.types.add("Clicker");

                this.onLoad((model) => {
                    const clickArea = model.WaitForChild("ClickArea") as BasePart;
                    clickArea.Touched.Connect(() => { });
                    const Items = GameUtils.items;

                    let target: Model | undefined;
                    let event: BindableEvent | undefined;
                    let t = 0;
                    const connection = RunService.Heartbeat.Connect((dt) => {
                        t += dt;
                        if (target === undefined || target.Parent === undefined) {
                            if (t > 0.05) {
                                t = 0;
                                const found = getPlacedItemsInArea(clickArea, Items);
                                for (const [model, item] of found)
                                    if (item.isA("Clickable")) {
                                        target = model;
                                        return;
                                    }
                            }
                        }
                        else if (t > 1 / (this.cps ?? 999)) {
                            t = 0;
                            if (event === undefined || event.Parent === undefined) {
                                event = target.WaitForChild("Click") as BindableEvent;
                            }
                            event.Fire(this.clickValue);
                            if (this.onClick !== undefined)
                                this.onClick(model, this);
                        }
                    });
                    model.Destroying.Once(() => connection.Disconnect());
                });
            }

            setCPS(cps: number) {
                this.cps = cps;
                return this;
            }

            setClickValue(clickValue: number) {
                this.clickValue = clickValue;
                return this;
            }

            setOnClick(onClick: (model: Model, item: Item) => void) {
                this.onClick = onClick;
                return this;
            }
        }
    }

    export class OmniUpgrader extends Upgrader {
        addsPerLaser = new Map<string, Price>();
        mulsPerLaser = new Map<string, Price>();

        constructor(id: string) {
            super(id);
            this.types.add("OmniUpgrader");
            this.onLoad((model) => {
                const lasers = new Set<string>();
                for (const [laser, _] of this.addsPerLaser)
                    lasers.add(laser);
                for (const [laser, _] of this.mulsPerLaser)
                    lasers.add(laser);

                const upgradedEvent = model.WaitForChild("UpgradedEvent") as BindableEvent;
                for (const laser of lasers) {
                    const part = model.WaitForChild(laser) as BasePart;
                    GameUtils.setInstanceInfo(part, "LaserId", part.Name);
                    Upgrader.hookLaser(model, this, part, upgradedEvent, (indicator) => indicator.Omni = laser);
                }
            });
        }

        setAdds(addsPerLaser: Map<string, Price>) {
            this.addsPerLaser = addsPerLaser;
            return this;
        }

        setMuls(mulsPerLaser: Map<string, Price>) {
            this.mulsPerLaser = mulsPerLaser;
            return this;
        }
    }
}

export = Special;