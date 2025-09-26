import { OnoeNum } from "@antivivi/serikanum";
import { Flamework, Modding, OnInit, OnPhysics, OnRender, OnStart, OnTick, Reflect } from "@flamework/core";
import { isConstructor } from "@flamework/core/out/utility";
import { useEffect, useState } from "@rbxts/react";
import { HttpService, Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import MusicManager from "client/MusicManager";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import PlayerProfileTemplate from "shared/data/profile/PlayerProfileTemplate";
import eat from "shared/hamster/eat";
import Unique from "shared/item/traits/Unique";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

class StoryMocking {
    static mockData() {
        const mockPlayerData = table.clone(PlayerProfileTemplate);

        Packets.buyItem.fromClient((player, itemId) => {
            print(`${player.Name} is buying item ${itemId}`);
            const inventory = Packets.inventory.get();
            inventory.set(itemId, (inventory.get(itemId) ?? 0) + 1);
            const bought = Packets.bought.get();
            bought.set(itemId, (bought.get(itemId) ?? 0) + 1);
            Packets.inventory.set(inventory);
            Packets.bought.set(bought);
            return true;
        });

        Packets.getLogs.fromClient((player) => {
            print(`${player.Name} is requesting logs`);
            return [];
        });

        useEffect(() => {
            const setSetting = Packets.setSetting.fromClient((player, setting, value) => {
                (mockPlayerData.settings as { [key: string]: unknown })[setting] = value;
                Packets.settings.setFor(player, mockPlayerData.settings);
            });

            const setHotkey = Packets.setHotkey.fromClient((player, key, action) => {
                mockPlayerData.settings.hotkeys[key] = action;
                Packets.settings.setFor(player, mockPlayerData.settings);
            });

            const cleanup = MusicManager.init();

            return () => {
                setSetting.Disconnect();
                setHotkey.Disconnect();
                cleanup();
            };
        }, []);

        const questInfos = new Map<string, QuestInfo>();
        questInfos.set("Quest1", {
            name: "First Quest",
            colorR: 255,
            colorG: 223,
            colorB: 62,
            level: 1,
            length: 1,
            reward: { xp: 100 },
            order: 1,
            stages: [{ description: "Complete the first task." }, { description: "Complete the second task." }],
        });
        questInfos.set("Quest2", {
            name: "Second Quest",
            colorR: 25,
            colorG: 66,
            colorB: 200,
            level: 4,
            length: 3,
            reward: { xp: 500, items: new Map([["TheFirstDropper", 1]]) },
            order: 2,
            stages: [{ description: "Complete the first task." }, { description: "Complete the second task." }],
        });
        questInfos.set("Quest3", {
            name: "Third Quest",
            colorR: 250,
            colorG: 20,
            colorB: 100,
            level: 4,
            length: 2,
            reward: { xp: 6000, items: new Map([["TheFirstConveyor", 1]]) },
            order: 3,
            stages: [
                { description: "Complete the first task." },
                { description: "Complete the second task." },
                { description: "Complete the third task." },
            ],
        });
        questInfos.set("Quest4", {
            name: "Fourth Quest",
            colorR: 6,
            colorG: 6,
            colorB: 200,
            level: 1,
            length: 4,
            reward: { xp: 6000 },
            order: 3,
            stages: [
                { description: "Complete the first task." },
                { description: "Complete the second task." },
                { description: "Complete the third task." },
            ],
        });
        Packets.questInfo.set(questInfos);

        const stagePerQuest = new Map<string, number>();
        stagePerQuest.set("Quest1", 1);
        stagePerQuest.set("Quest3", -1);
        stagePerQuest.set("Quest4", 2);
        Packets.stagePerQuest.set(stagePerQuest);

        useEffect(() => {
            const keys = new Array<string>();
            for (const [id, questInfo] of questInfos) {
                for (let stage = 0; stage < questInfo.stages.size(); stage++) {
                    const key = id + stage;
                    keys.push(key);
                    ReplicatedStorage.SetAttribute(key, new Vector3(stage * 10, 0, stage * 10));
                }
            }
            return () => {
                for (const key of keys) {
                    ReplicatedStorage.SetAttribute(key, undefined);
                }
            };
        }, []);

        Packets.level.set(2);
        Packets.xp.set(50);

        const random = new Random(42);
        const quantityPerItem = new Map<string, number>();
        const uniqueInstances = new Map<string, UniqueItemInstance>();

        for (const [id, item] of Items.itemsPerId) {
            if (item.isA("Unique")) {
                const pots = new Map<string, number>();
                for (const [id, _] of item.trait(Unique).getPotConfigs()) {
                    pots.set(id, random.NextNumber());
                }
                uniqueInstances.set(HttpService.GenerateGUID(false), {
                    baseItemId: id,
                    pots,
                    created: 0,
                });
            } else {
                quantityPerItem.set(id, random.NextInteger(1, 100));
            }
        }
        Packets.inventory.set(quantityPerItem);
        Packets.uniqueInstances.set(uniqueInstances);

        Packets.balance.set(this.mockCurrencies().amountPerCurrency);
        Packets.revenue.set(this.mockCurrencies().amountPerCurrency);
    }

    static mockCharacter() {
        const [rig, setRig] = useState<Model>();
        useEffect(() => {
            const newRig = this.generateDummyRig();
            newRig.Name = LOCAL_PLAYER?.Name ?? "Player";
            newRig.Parent = Workspace;
            if (LOCAL_PLAYER) {
                LOCAL_PLAYER.Character = newRig;
            }

            const connection = RunService.Heartbeat.Connect(() => {
                if (!newRig || !newRig.Parent || !newRig.PrimaryPart) return;
                const cameraCframe = Workspace.CurrentCamera?.CFrame;
                if (!cameraCframe) return;
                const modelPosition = cameraCframe.Position.sub(new Vector3(0, 10, 0));
                // Offset the model forward a bit so it faces the camera
                newRig.PivotTo(new CFrame(modelPosition.add(cameraCframe.LookVector.mul(10))));
            });

            setRig(newRig);
            return () => {
                newRig.Destroy();
                if (LOCAL_PLAYER) {
                    LOCAL_PLAYER.Character = undefined;
                    LOCAL_PLAYER.FindFirstChildOfClass("Backpack")?.ClearAllChildren();
                }
                connection.Disconnect();
            };
        }, []);
        return rig;
    }

    private static mockCurrencies() {
        const balance = new CurrencyBundle();
        for (const [currency] of pairs(CURRENCY_DETAILS)) {
            balance.set(currency, OnoeNum.fromSerika(math.random(1, 100), math.random(1, 500)));
        }
        return balance;
    }

    static mockFlamework() {
        // preload
        let isPreloading = false;
        const paths = [["ServerScriptService", "TS", "services"]];
        const preloadPaths = new Array<Instance>();
        for (const arg of paths) {
            const service = arg.shift();
            let currentPath = game.GetService(service as keyof Services) as Instance;
            if (service === "StarterPlayer") {
                if (arg[0] !== "StarterPlayerScripts") throw "StarterPlayer only supports StarterPlayerScripts";
                if (!RunService.IsClient()) throw "The server cannot load StarterPlayer content";
                currentPath = Players.LocalPlayer.WaitForChild("PlayerScripts");
                arg.shift();
            }
            for (let i = 0; i < arg.size(); i++) {
                currentPath = currentPath.WaitForChild(arg[i]);
            }
            preloadPaths.push(currentPath);
        }

        const preload = (moduleScript: ModuleScript) => {
            isPreloading = true;
            const start = os.clock();
            const [success, value] = pcall(() => require(moduleScript));
            const endTime = math.floor((os.clock() - start) * 1000);
            isPreloading = false;
            if (!success) {
                throw `${moduleScript.GetFullName()} failed to preload (${endTime}ms): ${value}`;
            }
        };

        for (const path of preloadPaths) {
            if (path.IsA("ModuleScript")) {
                preload(path);
            }
            for (const instance of path.GetDescendants()) {
                if (instance.IsA("ModuleScript")) {
                    preload(instance);
                }
            }
        }

        // ignite
        const idToObj = (Reflect as unknown as { idToObj: Map<string, object> }).idToObj;

        let inactiveThread: thread | undefined;
        function reusableThread(func: () => void) {
            const thread = coroutine.running();

            while (true) {
                if (inactiveThread === thread) {
                    inactiveThread = undefined;
                }

                func();

                // If there's a different idle thread, we should end the current thread.
                if (inactiveThread !== undefined) {
                    break;
                }

                inactiveThread = thread;
                [func] = coroutine.yield() as LuaTuple<[never]>;
            }
        }
        function reuseThread(func: () => void) {
            if (inactiveThread) {
                task.spawn(inactiveThread, func);
            } else {
                task.spawn(reusableThread, func);
            }
        }
        function profileYielding(func: () => void, _identifier: string) {
            return func;
        }
        function getIdentifier(obj: object, suffix = ""): string {
            return Reflect.getMetadata<string>(obj, "identifier") ?? `UnidentifiedFlameworkListener${suffix}`;
        }
        function topologicalSort(objects: string[]) {
            // This implementation ignores circular dependency trees.
            let currentSize = 0;
            const sorted = new Map<string, number>();
            const visited = new Set<string>();
            const visitor = (node: string) => {
                if (visited.has(node)) return;
                visited.add(node);

                const object = idToObj.get(node);
                if (!object) return;

                const dependencies = Reflect.getMetadata<string[]>(object, "flamework:parameters");
                for (const dependency of dependencies ?? []) {
                    visitor(dependency);
                }

                sorted.set(node, currentSize++);
            };

            for (const node of objects) {
                visitor(node);
            }

            return sorted;
        }

        for (const [, ctor] of idToObj) {
            if (!isConstructor(ctor)) continue;
            //if (!Reflect.getMetadata<boolean>(ctor, "flamework:singleton")) continue;
            if (Reflect.getMetadata<boolean>(ctor, "flamework:optional")) continue;

            Modding.resolveSingleton(ctor);
        }

        const dependencies = new Array<[instance: object, loadOrder: number]>();
        type Constructor<T = object> = new (...args: never[]) => T;
        const singletons = (Modding as unknown as { getSingletons: () => Map<Constructor, object> }).getSingletons();
        for (const [ctor, dependency] of singletons) {
            const loadOrder = Reflect.getMetadata<number>(ctor, "flamework:loadOrder") ?? 1;
            dependencies.push([dependency, loadOrder]);
        }

        const sortedDependencies = topologicalSort(dependencies.map(([obj]) => getIdentifier(obj)));
        const start = new Array<[OnStart, string]>();
        const init = new Array<[OnInit, string]>();

        const tick = new Map<OnTick, string>();
        const render = new Map<OnRender, string>();
        const physics = new Map<OnPhysics, string>();

        dependencies.sort(([depA, aOrder], [depB, bOrder]) => {
            if (aOrder !== bOrder) {
                return aOrder < bOrder;
            }

            const aIndex = sortedDependencies.get(getIdentifier(depA))!;
            const bIndex = sortedDependencies.get(getIdentifier(depB))!;
            return aIndex < bIndex;
        });

        Modding.onListenerAdded<OnTick>((object) => tick.set(object, getIdentifier(object, "/OnTick")));
        Modding.onListenerAdded<OnPhysics>((object) => physics.set(object, getIdentifier(object, "/OnPhysics")));
        Modding.onListenerAdded<OnRender>((object) => render.set(object, getIdentifier(object, "/OnRender")));

        Modding.onListenerRemoved<OnTick>((object) => tick.delete(object));
        Modding.onListenerRemoved<OnPhysics>((object) => physics.delete(object));
        Modding.onListenerRemoved<OnRender>((object) => render.delete(object));

        for (const [dependency] of dependencies) {
            if (Flamework.implements<OnInit>(dependency)) init.push([dependency, getIdentifier(dependency)]);
            if (Flamework.implements<OnStart>(dependency)) start.push([dependency, getIdentifier(dependency)]);
        }

        for (const [dependency, identifier] of init) {
            const initResult = dependency.onInit();
            if (Promise.is(initResult)) {
                const [status, value] = initResult.awaitStatus();
                if (status === Promise.Status.Rejected) {
                    throw `OnInit failed for dependency '${identifier}'. ${tostring(value)}`;
                }
            }
        }

        debug.resetmemorycategory();

        eat(
            RunService.Heartbeat.Connect((dt) => {
                for (const [dependency, identifier] of tick) {
                    reuseThread(profileYielding(() => dependency.onTick(dt), identifier));
                }
            }),
        );

        eat(
            RunService.Stepped.Connect((time, dt) => {
                for (const [dependency, identifier] of physics) {
                    reuseThread(profileYielding(() => dependency.onPhysics(dt, time), identifier));
                }
            }),
        );

        for (const [dependency, identifier] of start) {
            reuseThread(profileYielding(() => dependency.onStart(), identifier));
        }
    }

    /**
     * Generates a dummy rig for previewing character interactions.
     * Does **not** support any built-in animations, but has an {@link Animator} for running custom ones.
     * @see {@link https://www.github.com/Validark/rbxts-Object-To-Tree} Auto-generated from a template rig.
     */
    private static generateDummyRig() {
        const Rig = new Instance("Model");

        const Head = new Instance("Part");
        Head.Color = Color3.fromRGB(215, 197, 154);
        Head.Name = "Head";
        Head.PivotOffset = CFrame.fromOrientation(math.rad(0), math.rad(0), math.rad(0)).add(new Vector3(0, -4.5, 0));
        Head.Size = new Vector3(2, 1, 1);
        Head.TopSurface = Enum.SurfaceType.Smooth;
        Rig.PrimaryPart = Head;
        Head.Parent = Rig;

        const LeftArm = new Instance("Part");
        LeftArm.CanCollide = false;
        LeftArm.Color = Color3.fromRGB(161, 196, 140);
        LeftArm.Name = "Left Arm";
        LeftArm.Size = new Vector3(1, 2, 1);
        LeftArm.Parent = Rig;

        const RightArm = new Instance("Part");
        RightArm.CanCollide = false;
        RightArm.Color = Color3.fromRGB(161, 196, 140);
        RightArm.Name = "Right Arm";
        RightArm.Size = new Vector3(1, 2, 1);
        RightArm.Parent = Rig;

        const LeftLeg = new Instance("Part");
        LeftLeg.BottomSurface = Enum.SurfaceType.Smooth;
        LeftLeg.CanCollide = false;
        LeftLeg.Color = Color3.fromRGB(110, 153, 202);
        LeftLeg.Name = "Left Leg";
        LeftLeg.Size = new Vector3(1, 2, 1);
        LeftLeg.Parent = Rig;

        const RightLeg = new Instance("Part");
        RightLeg.BottomSurface = Enum.SurfaceType.Smooth;
        RightLeg.CanCollide = false;
        RightLeg.Color = Color3.fromRGB(110, 153, 202);
        RightLeg.Name = "Right Leg";
        RightLeg.Size = new Vector3(1, 2, 1);
        RightLeg.Parent = Rig;

        const Mesh = new Instance("SpecialMesh");
        Mesh.Scale = new Vector3(1.25, 1.25, 1.25);
        Mesh.Parent = Head;

        const HairAttachment = new Instance("Attachment");
        HairAttachment.Name = "HairAttachment";
        HairAttachment.Position = new Vector3(0, 0.6, 0);
        HairAttachment.Parent = Head;

        const HatAttachment = new Instance("Attachment");
        HatAttachment.Name = "HatAttachment";
        HatAttachment.Position = new Vector3(0, 0.6, 0);
        HatAttachment.Parent = Head;

        const FaceFrontAttachment = new Instance("Attachment");
        FaceFrontAttachment.Name = "FaceFrontAttachment";
        FaceFrontAttachment.Position = new Vector3(0, 0, -0.6);
        FaceFrontAttachment.Parent = Head;

        const FaceCenterAttachment = new Instance("Attachment");
        FaceCenterAttachment.Name = "FaceCenterAttachment";
        FaceCenterAttachment.Parent = Head;

        const face = new Instance("Decal");
        face.Name = "face";
        face.Texture = "http://www.roblox.com/asset/?id=144080495";
        face.Parent = Head;

        const Torso = new Instance("Part");
        Torso.Color = Color3.fromRGB(0, 0, 255);
        Torso.LeftSurface = Enum.SurfaceType.Weld;
        Torso.Name = "Torso";
        Torso.RightSurface = Enum.SurfaceType.Weld;
        Torso.Size = new Vector3(2, 2, 1);
        Torso.Parent = Rig;

        const roblox = new Instance("Decal");
        roblox.Name = "roblox";
        roblox.Parent = Torso;

        const NeckAttachment = new Instance("Attachment");
        NeckAttachment.Name = "NeckAttachment";
        NeckAttachment.Position = new Vector3(0, 1, 0);
        NeckAttachment.Parent = Torso;

        const BodyFrontAttachment = new Instance("Attachment");
        BodyFrontAttachment.Name = "BodyFrontAttachment";
        BodyFrontAttachment.Position = new Vector3(0, 0, -0.5);
        BodyFrontAttachment.Parent = Torso;

        const BodyBackAttachment = new Instance("Attachment");
        BodyBackAttachment.Name = "BodyBackAttachment";
        BodyBackAttachment.Position = new Vector3(0, 0, 0.5);
        BodyBackAttachment.Parent = Torso;

        const LeftCollarAttachment = new Instance("Attachment");
        LeftCollarAttachment.Name = "LeftCollarAttachment";
        LeftCollarAttachment.Position = new Vector3(-1, 1, 0);
        LeftCollarAttachment.Parent = Torso;

        const RightCollarAttachment = new Instance("Attachment");
        RightCollarAttachment.Name = "RightCollarAttachment";
        RightCollarAttachment.Position = new Vector3(1, 1, 0);
        RightCollarAttachment.Parent = Torso;

        const WaistFrontAttachment = new Instance("Attachment");
        WaistFrontAttachment.Name = "WaistFrontAttachment";
        WaistFrontAttachment.Position = new Vector3(0, -1, -0.5);
        WaistFrontAttachment.Parent = Torso;

        const WaistCenterAttachment = new Instance("Attachment");
        WaistCenterAttachment.Name = "WaistCenterAttachment";
        WaistCenterAttachment.Position = new Vector3(0, -1, 0);
        WaistCenterAttachment.Parent = Torso;

        const WaistBackAttachment = new Instance("Attachment");
        WaistBackAttachment.Name = "WaistBackAttachment";
        WaistBackAttachment.Position = new Vector3(0, -1, 0.5);
        WaistBackAttachment.Parent = Torso;

        const RightShoulder = new Instance("Motor6D");
        RightShoulder.C0 = CFrame.fromOrientation(math.rad(0), math.rad(90), math.rad(0)).add(new Vector3(1, 0.5, 0));
        RightShoulder.C1 = CFrame.fromOrientation(math.rad(0), math.rad(90), math.rad(0)).add(
            new Vector3(-0.5, 0.5, 0),
        );
        RightShoulder.MaxVelocity = 0.1;
        RightShoulder.Name = "Right Shoulder";
        RightShoulder.Part0 = Torso;
        RightShoulder.Part1 = RightArm;
        RightShoulder.Parent = Torso;

        const LeftShoulder = new Instance("Motor6D");
        LeftShoulder.C0 = CFrame.fromOrientation(math.rad(0), math.rad(-90), math.rad(0)).add(new Vector3(-1, 0.5, 0));
        LeftShoulder.C1 = CFrame.fromOrientation(math.rad(0), math.rad(-90), math.rad(0)).add(new Vector3(0.5, 0.5, 0));
        LeftShoulder.MaxVelocity = 0.1;
        LeftShoulder.Name = "Left Shoulder";
        LeftShoulder.Part0 = Torso;
        LeftShoulder.Part1 = LeftArm;
        LeftShoulder.Parent = Torso;

        const RightHip = new Instance("Motor6D");
        RightHip.C0 = CFrame.fromOrientation(math.rad(0), math.rad(90), math.rad(0)).add(new Vector3(1, -1, 0));
        RightHip.C1 = CFrame.fromOrientation(math.rad(0), math.rad(90), math.rad(0)).add(new Vector3(0.5, 1, 0));
        RightHip.MaxVelocity = 0.1;
        RightHip.Name = "Right Hip";
        RightHip.Part0 = Torso;
        RightHip.Part1 = RightLeg;
        RightHip.Parent = Torso;

        const LeftHip = new Instance("Motor6D");
        LeftHip.C0 = CFrame.fromOrientation(math.rad(0), math.rad(-90), math.rad(0)).add(new Vector3(-1, -1, 0));
        LeftHip.C1 = CFrame.fromOrientation(math.rad(0), math.rad(-90), math.rad(0)).add(new Vector3(-0.5, 1, 0));
        LeftHip.MaxVelocity = 0.1;
        LeftHip.Name = "Left Hip";
        LeftHip.Part0 = Torso;
        LeftHip.Part1 = LeftLeg;
        LeftHip.Parent = Torso;

        const Neck = new Instance("Motor6D");
        Neck.C0 = CFrame.fromOrientation(math.rad(-90), math.rad(180), math.rad(0)).add(new Vector3(0, 1, 0));
        Neck.C1 = CFrame.fromOrientation(math.rad(-90), math.rad(180), math.rad(0)).add(new Vector3(0, -0.5, 0));
        Neck.MaxVelocity = 0.1;
        Neck.Name = "Neck";
        Neck.Part0 = Torso;
        Neck.Part1 = Head;
        Neck.Parent = Torso;

        const LeftShoulderAttachment = new Instance("Attachment");
        LeftShoulderAttachment.Name = "LeftShoulderAttachment";
        LeftShoulderAttachment.Position = new Vector3(0, 1, 0);
        LeftShoulderAttachment.Parent = LeftArm;

        const LeftGripAttachment = new Instance("Attachment");
        LeftGripAttachment.Name = "LeftGripAttachment";
        LeftGripAttachment.Position = new Vector3(0, -1, 0);
        LeftGripAttachment.Parent = LeftArm;

        const RightShoulderAttachment = new Instance("Attachment");
        RightShoulderAttachment.Name = "RightShoulderAttachment";
        RightShoulderAttachment.Position = new Vector3(0, 1, 0);
        RightShoulderAttachment.Parent = RightArm;

        const RightGripAttachment = new Instance("Attachment");
        RightGripAttachment.Name = "RightGripAttachment";
        RightGripAttachment.Position = new Vector3(0, -1, 0);
        RightGripAttachment.Parent = RightArm;

        const LeftFootAttachment = new Instance("Attachment");
        LeftFootAttachment.Name = "LeftFootAttachment";
        LeftFootAttachment.Position = new Vector3(0, -1, 0);
        LeftFootAttachment.Parent = LeftLeg;

        const RightFootAttachment = new Instance("Attachment");
        RightFootAttachment.Name = "RightFootAttachment";
        RightFootAttachment.Position = new Vector3(0, -1, 0);
        RightFootAttachment.Parent = RightLeg;

        const Humanoid = new Instance("Humanoid");
        Humanoid.Parent = Rig;

        const Animator = new Instance("Animator");
        Animator.Parent = Humanoid;

        const HumanoidDescription = new Instance("HumanoidDescription");
        HumanoidDescription.BodyTypeScale = 0;
        HumanoidDescription.Face = 144075659;
        HumanoidDescription.HeadColor = Color3.fromRGB(215, 197, 154);
        HumanoidDescription.HeadScale = 0.9500000000000001;
        HumanoidDescription.HeightScale = 0.9;
        HumanoidDescription.LeftArmColor = Color3.fromRGB(161, 196, 140);
        HumanoidDescription.LeftLegColor = Color3.fromRGB(110, 153, 202);
        HumanoidDescription.ProportionScale = 0;
        HumanoidDescription.RightArmColor = Color3.fromRGB(161, 196, 140);
        HumanoidDescription.RightLegColor = Color3.fromRGB(110, 153, 202);
        HumanoidDescription.Shirt = 6273011617;
        HumanoidDescription.TorsoColor = Color3.fromRGB(0, 0, 255);
        HumanoidDescription.Parent = Humanoid;

        const BodyPartDescription = new Instance("BodyPartDescription");
        BodyPartDescription.Color = Color3.fromRGB(215, 197, 154);
        BodyPartDescription.Parent = HumanoidDescription;

        const LeftArmPartDescription = new Instance("BodyPartDescription");
        LeftArmPartDescription.BodyPart = Enum.BodyPart.LeftArm;
        LeftArmPartDescription.Color = Color3.fromRGB(161, 196, 140);
        LeftArmPartDescription.Parent = HumanoidDescription;

        const RightArmPartDescription = new Instance("BodyPartDescription");
        RightArmPartDescription.BodyPart = Enum.BodyPart.RightArm;
        RightArmPartDescription.Color = Color3.fromRGB(161, 196, 140);
        RightArmPartDescription.Parent = HumanoidDescription;

        const TorsoPartDescription = new Instance("BodyPartDescription");
        TorsoPartDescription.BodyPart = Enum.BodyPart.Torso;
        TorsoPartDescription.Color = Color3.fromRGB(0, 0, 255);
        TorsoPartDescription.Parent = HumanoidDescription;

        const LeftLegPartDescription = new Instance("BodyPartDescription");
        LeftLegPartDescription.BodyPart = Enum.BodyPart.LeftLeg;
        LeftLegPartDescription.Color = Color3.fromRGB(110, 153, 202);
        LeftLegPartDescription.Parent = HumanoidDescription;

        const RightLegPartDescription = new Instance("BodyPartDescription");
        RightLegPartDescription.BodyPart = Enum.BodyPart.RightLeg;
        RightLegPartDescription.Color = Color3.fromRGB(110, 153, 202);
        RightLegPartDescription.Parent = HumanoidDescription;

        const HumanoidRootPart = new Instance("Part");
        HumanoidRootPart.BottomSurface = Enum.SurfaceType.Smooth;
        HumanoidRootPart.CanCollide = false;
        HumanoidRootPart.Name = "HumanoidRootPart";
        HumanoidRootPart.Size = new Vector3(2, 2, 1);
        HumanoidRootPart.TopSurface = Enum.SurfaceType.Smooth;
        HumanoidRootPart.Transparency = 1;
        HumanoidRootPart.Parent = Rig;

        const RootAttachment = new Instance("Attachment");
        RootAttachment.Name = "RootAttachment";
        RootAttachment.Parent = HumanoidRootPart;

        const RootJoint = new Instance("Motor6D");
        RootJoint.C0 = CFrame.fromOrientation(math.rad(-90), math.rad(180), math.rad(0)).add(new Vector3(0, 0, 0));
        RootJoint.C1 = CFrame.fromOrientation(math.rad(-90), math.rad(180), math.rad(0)).add(new Vector3(0, 0, 0));
        RootJoint.MaxVelocity = 0.1;
        RootJoint.Name = "RootJoint";
        RootJoint.Part0 = HumanoidRootPart;
        RootJoint.Part1 = Torso;
        RootJoint.Parent = HumanoidRootPart;

        const Shirt = new Instance("Shirt");
        Shirt.Name = "Shirt";
        Shirt.ShirtTemplate = "http://www.roblox.com/asset/?id=6273011603";
        Shirt.Parent = Rig;

        const BodyColors = new Instance("BodyColors");
        BodyColors.HeadColor = new BrickColor("Brick yellow");
        BodyColors.HeadColor3 = Color3.fromRGB(215, 197, 154);
        BodyColors.LeftArmColor = new BrickColor("Medium green");
        BodyColors.LeftArmColor3 = Color3.fromRGB(161, 196, 140);
        BodyColors.LeftLegColor = new BrickColor("Medium blue");
        BodyColors.LeftLegColor3 = Color3.fromRGB(110, 153, 202);
        BodyColors.RightArmColor = new BrickColor("Medium green");
        BodyColors.RightArmColor3 = Color3.fromRGB(161, 196, 140);
        BodyColors.RightLegColor = new BrickColor("Medium blue");
        BodyColors.RightLegColor3 = Color3.fromRGB(110, 153, 202);
        BodyColors.TorsoColor = new BrickColor("Really blue");
        BodyColors.TorsoColor3 = Color3.fromRGB(0, 0, 255);
        BodyColors.Parent = Rig;

        return Rig;
    }
}

export = StoryMocking;
