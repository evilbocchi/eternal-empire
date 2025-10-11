import { simpleInterval } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useRef } from "@rbxts/react";
import { CollectionService, Workspace } from "@rbxts/services";
import Sandbox from "shared/Sandbox";
import WorldNode from "shared/world/nodes/WorldNode";

interface TrackingDetails {
    model: Model;
    head: BasePart;
    neck: Motor6D;
    originalNeckC0: CFrame;
}

const TRACKING_DISTANCE = 20;
const UPDATE_INTERVAL = 0.05;
const LERP_ALPHA = 0.3;

export default function EyeContactManager() {
    const trackingRef = useRef(new Map<Model, TrackingDetails>());

    useEffect(() => {
        if (Sandbox.getEnabled()) {
            return;
        }

        const tracking = trackingRef.current;

        const getClosestTarget = (model: Model) => {
            let closest: Model | undefined;
            let closestDistance = TRACKING_DISTANCE;
            const modelPrimaryPart = model.PrimaryPart;
            if (modelPrimaryPart === undefined) {
                return undefined;
            }

            for (const candidate of CollectionService.GetTagged("NPC")) {
                if (!candidate.IsA("Model") || !candidate.FindFirstChild("Humanoid")) {
                    continue;
                }
                if (candidate === model) {
                    continue;
                }

                const primaryPart = candidate.PrimaryPart;
                if (primaryPart === undefined) {
                    continue;
                }

                const distance = modelPrimaryPart.Position.sub(primaryPart.Position).Magnitude;
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = candidate;
                }
            }

            return closest;
        };

        const lookAt = (model: Model, target: BasePart | undefined) => {
            const details = tracking.get(model);
            if (details === undefined) {
                return;
            }

            const { neck, head, originalNeckC0 } = details;
            if (target === undefined) {
                neck.C0 = neck.C0.Lerp(originalNeckC0, LERP_ALPHA);
                return;
            }

            const headCFrame = head.CFrame;
            const delta = headCFrame.Position.sub(target.Position);
            const distance = delta.Magnitude;
            if (distance === 0) {
                neck.C0 = neck.C0.Lerp(originalNeckC0, LERP_ALPHA);
                return;
            }

            const verticalOffset = delta.Y;
            const crossTerm = headCFrame.Position.sub(target.Position).Unit.Cross(headCFrame.LookVector).Y;
            const destination = originalNeckC0.mul(
                CFrame.Angles(math.atan(verticalOffset / distance) * 0.5, 0, crossTerm * 0.8),
            );
            neck.C0 = neck.C0.Lerp(destination, LERP_ALPHA);
        };

        const resetModel = (details: TrackingDetails) => {
            details.neck.C0 = details.originalNeckC0;
        };

        const npcWorldNode = new WorldNode<Model>(
            "NPC",
            (npcModel) => {
                if (!npcModel.IsA("Model") || tracking.has(npcModel)) {
                    return;
                }

                const torso = npcModel.FindFirstChild("Torso") as BasePart | undefined;
                if (torso === undefined) {
                    return;
                }

                const neck = torso.FindFirstChild("Neck") as Motor6D | undefined;
                if (neck === undefined) {
                    return;
                }

                const head = npcModel.FindFirstChild("Head") as BasePart | undefined;
                if (head === undefined) {
                    return;
                }

                tracking.set(npcModel, {
                    model: npcModel,
                    head,
                    neck,
                    originalNeckC0: neck.C0,
                });
            },
            (npcModel) => {
                if (!npcModel.IsA("Model")) {
                    return;
                }

                const details = tracking.get(npcModel);
                if (details !== undefined) {
                    resetModel(details);
                    tracking.delete(npcModel);
                }
            },
        );

        const intervalCleanup = simpleInterval(() => {
            for (const [model] of tracking) {
                const closest = getClosestTarget(model);
                if (closest !== undefined) {
                    const head = closest.FindFirstChild("Head") as BasePart | undefined;
                    lookAt(model, head);
                } else {
                    lookAt(model, undefined);
                }
            }
        }, UPDATE_INTERVAL);

        return () => {
            intervalCleanup();
            npcWorldNode.cleanup();
            for (const [, details] of tracking) {
                resetModel(details);
            }
            tracking.clear();
        };
    }, []);

    return <Fragment />;
}
