import React, { Fragment, useEffect } from "@rbxts/react";
import { Debris, ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import createEtohConveyor from "client/components/effect/etoh/createEtohConveyor";
import createEtohFallingPlatform from "client/components/effect/etoh/createEtohFallingPlatform";
import createEtohTeleporter from "client/components/effect/etoh/createEtohTeleporter";
import { observeCharacter } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Packets from "shared/Packets";
import WorldNode from "shared/world/nodes/WorldNode";

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
        function applyPart(part: Instance) {
            if (part.IsA("BasePart")) {
                if (part.FindFirstChild("Invisible")) {
                    part.LocalTransparencyModifier = 1;
                }
                if (part.HasTag("ClientUnanchored")) {
                    part.Anchored = false;
                }
            }

            if (part.Name === "Teleporter" && part.IsA("Model")) {
                createEtohTeleporter(part)();
            } else if (part.Name === "Conveyor" && part.IsA("BasePart")) {
                createEtohConveyor(part)();
            } else if (part.Name === "Falling Platform" && part.IsA("Model")) {
                createEtohFallingPlatform(part)();
            }
        }

        function addChildren(original: Instance, clone: Instance) {
            original.ChildAdded.Connect((v) => {
                const c = v.Clone();
                c.Parent = clone;
                addChildren(v, c);
                applyPart(original);
            });
        }

        const added = new Set<Instance>();
        function addPart(part: Instance) {
            const clone = part?.Clone();
            if (!clone) return;
            clone.RemoveTag("ClientSidedObject"); // Prevent recursion
            clone.Parent = Workspace;
            added.add(clone);
            addChildren(part, clone);
            applyPart(clone);
            for (const descendant of clone.GetDescendants()) {
                applyPart(descendant);
            }
        }

        const clientSidedObjectWorldNode = new WorldNode("ClientSidedObject", (instance) => {
            addPart(instance);
            if (!IS_EDIT) {
                instance.Parent = ReplicatedStorage;
            }
        });

        return () => {
            for (const instance of added) {
                instance.Destroy();
            }
            clientSidedObjectWorldNode.cleanup();
        };
    }, []);

    return <Fragment />;
}
