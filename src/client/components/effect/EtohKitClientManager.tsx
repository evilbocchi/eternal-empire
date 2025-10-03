import React, { Fragment, useEffect } from "@rbxts/react";
import { Debris, ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { observeCharacter } from "client/constants";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Packets from "shared/Packets";

/**
 * EToH Kit upstream (Client)
 */
export default function EtohKitClientManager() {
    // TouchScript
    useEffect(() => {
        const cleanup = observeCharacter((character) => {
            const humanoid = character.WaitForChild("Humanoid") as Humanoid;

            humanoid.Touched.Connect((tP, hP) => {
                const isButtonOrBeatBlock =
                    (tP.Name === "ButtonActivatedPlatform" || tP.Parent?.Parent?.Name === "Beat Blocks") &&
                    !tP.CanCollide;

                const healthOk = humanoid.Health > 0 && hP.Name !== "Part";

                if (tP.FindFirstChild("kills")) {
                    if (isButtonOrBeatBlock) return;
                    if (healthOk) {
                        Packets.damaged.toServer("Normal");
                    }
                }
                if (tP.FindFirstChild("double")) {
                    if (isButtonOrBeatBlock) return;
                    if (healthOk) {
                        Packets.damaged.toServer("DoubleDamage");
                    }
                }
                if (tP.FindFirstChild("ouch")) {
                    if (isButtonOrBeatBlock) return;
                    if (healthOk) {
                        Packets.damaged.toServer("HighDamage");
                    }
                }
                if (tP.FindFirstChild("instakills")) {
                    if (isButtonOrBeatBlock) return;
                    if (healthOk) {
                        Packets.damaged.toServer("Instakill");
                    }
                }
            });
        });

        return cleanup;
    }, []);

    // Flip
    useEffect(() => {
        function flip() {
            const character = getPlayerCharacter();
            if (!character) return;

            const torso = character.FindFirstChild("Torso") as BasePart | undefined;
            if (!torso) return;

            let touch = torso.FindFirstChild("TouchInterest");
            if (!touch) {
                torso.Touched.Connect(() => {});
            }

            for (const t of torso.GetTouchingParts()) {
                if (t.FindFirstChild("CanFlip") && t.CanCollide) {
                    const offsetFromPart = t.CFrame.ToObjectSpace(torso.CFrame);
                    let cframeSet: BasePart = t;
                    const teleToObject = t.FindFirstChild("TeleToObject") as ObjectValue | undefined;
                    if (teleToObject && teleToObject.Value && teleToObject.Value.IsA("BasePart")) {
                        cframeSet = teleToObject.Value;
                    }
                    torso.CFrame = cframeSet.CFrame.mul(CFrame.Angles(0, math.pi, 0)).mul(offsetFromPart);

                    const sound = new Instance("Sound");
                    sound.SoundId = "rbxasset://sounds//electronicpingshort.wav";
                    sound.Volume = 0.3;

                    if (sound) {
                        sound.Parent = cframeSet;
                        sound.Play();
                        Debris.AddItem(sound, 0.8);
                    }
                    break;
                }
            }
        }

        const beganConnection = UserInputService.InputBegan.Connect((inputObj, processed) => {
            if (!processed) {
                const keycode = inputObj.KeyCode;
                if (keycode === Enum.KeyCode.F || keycode === Enum.KeyCode.ButtonX) {
                    flip();
                }
            }
        });

        let tapConnection: RBXScriptConnection | undefined;
        if (UserInputService.TouchEnabled && !UserInputService.KeyboardEnabled) {
            tapConnection = UserInputService.TouchTapInWorld.Connect((touches, processed) => {
                if (!processed) {
                    flip();
                }
            });
        }

        return () => {
            beganConnection.Disconnect();
            tapConnection?.Disconnect();
        };
    });

    // LocalPartScript
    useEffect(() => {
        const coFolder = ReplicatedStorage.WaitForChild("ClientSidedObjects") as Folder | undefined;
        if (!coFolder) {
            warn('NO FOLDER NAMED "ClientSidedObjects"!!! NO CLIENT OBJECTS WILL FUNCTION!!!');
        }

        const clientParts = new Instance("Folder");
        clientParts.Name = "ClientParts";
        clientParts.Parent = Workspace;

        // Double client object remover
        for (const d of coFolder?.GetDescendants() ?? []) {
            if (d.Parent && d.Name === "ClientObject") {
                for (const o of d.Parent.GetDescendants()) {
                    if (o.Name === "ClientObject" && d !== o) {
                        warn(`⚠️ Found a double client object value in: ${d.Parent.Name} ⚠️`);
                        o.Destroy();
                    }
                }
            }
        }

        function ApplyPart(w: Instance) {
            if (w.Name === "ClientObjectScript") {
                task.spawn(() => {
                    (require(w as ModuleScript) as Callback)();
                });
            } else if (w.IsA("BasePart")) {
                const setCollisionGroup = w.FindFirstChild("SetCollisionGroup") as StringValue | undefined;
                if (setCollisionGroup) {
                    task.spawn(() => {
                        w.CollisionGroup = setCollisionGroup.Value;
                    });
                } else {
                    w.CollisionGroup = "ClientObjects";
                }

                if (w.Name === "LightingChanger" || w.FindFirstChild("Invisible")) {
                    w.Transparency = 1;
                }
            }
        }

        function addChildren(p: Instance, np: Instance) {
            p.ChildAdded.Connect((v) => {
                const c = v.Clone();
                c.Parent = np;
                addChildren(v, c);
                ApplyPart(p);
            });
        }

        function addPart(v: Instance) {
            if (v.Name === "ClientObject" && v.Parent) {
                const c = v.Parent.Clone();
                c.Parent = clientParts;
                addChildren(v, c);
                ApplyPart(c);
                for (const w of c.GetDescendants()) {
                    ApplyPart(w);
                }
            }
        }

        for (const v of coFolder?.GetDescendants() ?? []) {
            addPart(v);
        }

        return () => {
            clientParts.Destroy();
        };
    }, []);

    return <Fragment />;
}
