import { RunService, TweenService, Workspace } from "@rbxts/services";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";
import Item from "./Item";
import Upgrader from "./Upgrader";
import Items from "shared/items/Items";

namespace Special {
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
                        tween = TweenService.Create(v, new TweenInfo(1), {Value: 360});
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
            const noob = model.WaitForChild("Noob") as Model;
            const humanoid = noob.FindFirstChildOfClass("Humanoid");
            if (humanoid === undefined) {
                return;
            }
            const animator = humanoid.FindFirstChildOfClass("Animator");
            if (animator === undefined) {
                return;
            }
            const animation = loadAnimation(humanoid, 16920778613);
            const laser = model.WaitForChild("Laser") as BasePart;
            const slash = model.WaitForChild("Slash") as BasePart;
            slash.Transparency = 1;
            const sound = laser.WaitForChild("Sound") as Sound;
            const slashOriginalCFrame = slash.CFrame;
            const oCFrame = laser.CFrame;
            const bye = oCFrame.sub(new Vector3(0, 10000, 0));
            laser.CFrame = bye;
            item.repeat(model, () => {
                slash.Transparency = 0.011;
                slash.CFrame = slashOriginalCFrame;
                TweenService.Create(slash, new TweenInfo(0.3), {CFrame: slashOriginalCFrame.mul(CFrame.Angles(0, math.rad(180), 0)), Transparency: 1}).Play();
                animation?.Play();
                sound.Play();
                laser.CFrame = oCFrame;
                task.delay(0.5, () => {
                    laser.CFrame = bye;
                });
            }, cd);
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
                this.types.push("Damager");
                this.onLoad((model) => (model.WaitForChild("UpgradedEvent") as BindableEvent).Event.Connect((droplet: Instance) => {
                    const health = droplet.GetAttribute("Health") as number | undefined;
                    if (health === undefined) {
                        return;
                    }
                    droplet.SetAttribute("Health", health - this.damage);
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
            setOnClick(onClick: (model: Model, utils: ItemUtils, item: Item) => void): ThisType<Clickable>;
        }
        
        export class ManumaticUpgrader extends Upgrader implements Clickable {
            debounce = 0.1;
            onClick: ((model: Model, utils: ItemUtils, item: Item, player: Player | undefined, value: number) => void) | undefined;

            constructor(id: string) {
                super(id);
                this.types.push("Clickable");
                this.onLoad((model, utils, item) => {
                    const clickDetector = new Instance("ClickDetector");
                    let last = 0;
                    const click = (player: Player | undefined, value: number) => {
                        const onClick = this.onClick;
                        if (onClick !== undefined) {
                            onClick(model, utils, item, player, value);
                        }
                    }
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
                })
            }

            setDebounce(debounce: number) {
                this.debounce = debounce;
                return this;
            }

            setOnClick(onClick: (model: Model, utils: ItemUtils, item: Item, player: Player | undefined, value: number) => void) {
                this.onClick = onClick;
                return this;
            }
        }

        export class Clicker extends Item {

            cps: number | undefined = undefined;
            clickValue = 1;
            onClick: ((model: Model, utils: ItemUtils, item: Item) => void) | undefined = undefined;

            constructor(id: string) {
                super(id);
                this.types.push("Clicker");

                this.onLoad((model, utils) => {
                    const clickArea = model.WaitForChild("ClickArea") as BasePart;
                    clickArea.Touched.Connect(() => {});
                    const find = () => {
                        const array = clickArea.GetTouchingParts();
                        for (const touching of array) {
                            const target = touching.FindFirstAncestorOfClass("Model");
                            if (target === undefined) {
                                continue;
                            }
                            const itemId = target.GetAttribute("ItemId") as string;
                            if (itemId === undefined) {
                                continue;
                            }
                            const item = Items.getItem(itemId);
                            if (item === undefined) {
                                error();
                            }
                            if (item.isA("Clickable")) {
                                return target;
                            }
                        }
                    }
                    let target = find();
                    let event: BindableEvent | undefined;
                    let t = 0;
                    const connection = RunService.Heartbeat.Connect((dt) => {
                        t += dt;
                        if (target === undefined || target.Parent === undefined) {
                            if (t > 1) {
                                t = 0;
                                target = find();
                            }
                        }
                        else if (t > 1 / (this.cps ?? 999) && this.onClick !== undefined) {
                            t = 0;
                            if (event === undefined) {
                                event = target.WaitForChild("Click") as BindableEvent;
                            }
                            event.Fire(this.clickValue);
                            this.onClick(model, utils, this);
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

            setOnClick(onClick: (model: Model, utils: ItemUtils, item: Item) => void) {
                this.onClick = onClick;
                return this;
            }
        }
    }
}

export = Special;