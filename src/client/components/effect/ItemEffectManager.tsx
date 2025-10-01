import { rainbowEffect } from "@antivivi/vrldk";
import React, { Fragment, useEffect } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import WorldNode from "shared/world/nodes/WorldNode";

export default function DropletSurgeManager() {
    useEffect(() => {
        const isReady = (instance: Instance): instance is BasePart => {
            if (!instance.IsA("BasePart")) return false;
            if (!instance.IsDescendantOf(PLACED_ITEMS_FOLDER)) return false;
            return true;
        };

        const rainbowWorldNode = new WorldNode("Rainbow", (instance) => {
            if (!isReady(instance)) return;
            rainbowEffect(instance as BasePart, 2);
        });

        const spinnerWorldNode = new WorldNode("Spinner", (instance) => {
            if (!isReady(instance)) return;

            const createRandomTween = () => {
                if (instance === undefined || instance.Parent === undefined) return;

                const tween = TweenService.Create(instance, new TweenInfo(2, Enum.EasingStyle.Linear), {
                    Orientation: new Vector3(math.random(0, 360), math.random(0, 360), math.random(0, 360)),
                });
                tween.Completed.Once(createRandomTween);
                tween.Play();
            };
            createRandomTween();
        });

        const tweenInfo = new TweenInfo(2, Enum.EasingStyle.Linear);
        function rotationLoop(instance: BasePart, delta: number) {
            const tween = TweenService.Create(instance, tweenInfo, {
                CFrame: instance.CFrame.mul(CFrame.Angles(0, delta, 0)),
            });
            tween.Completed.Once(() => rotationLoop(instance, delta));
            tween.Play();
            return tween;
        }

        const clockwiseWorldNode = new WorldNode("Clockwise", (instance) => {
            if (!isReady(instance)) return;
            const tween = rotationLoop(instance, math.pi);
            return () => tween.Destroy();
        });

        const anticlockwiseWorldNode = new WorldNode("Anticlockwise", (instance) => {
            if (!isReady(instance)) return;
            const tween = rotationLoop(instance, -math.pi);
            return () => tween.Destroy();
        });

        return () => {
            rainbowWorldNode.cleanup();
            spinnerWorldNode.cleanup();
            clockwiseWorldNode.cleanup();
            anticlockwiseWorldNode.cleanup();
        };
    }, []);

    return <Fragment />;
}
