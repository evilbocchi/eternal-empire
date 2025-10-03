import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            name: "MODELNAMEHERE",
        },
    },
    (props) => {
        const model = Workspace.FindFirstChild(props.controls.name);
        if (!model || !model.IsA("Model")) {
            return <Fragment />;
        }
        const modelClone = model.Clone();
        for (const child of modelClone.GetDescendants()) {
            if (child.IsA("BasePart")) {
                const snappedSize = new Vector3(
                    math.round(child.Size.X * 8) / 8,
                    math.round(child.Size.Y * 8) / 8,
                    math.round(child.Size.Z * 8) / 8,
                );
                // Snap minimum corner to 1/8th grid, then recenter
                const minCorner = child.Position.sub(child.Size.div(2));
                const snappedMinCorner = new Vector3(
                    math.round(minCorner.X * 8) / 8,
                    math.round(minCorner.Y * 8) / 8,
                    math.round(minCorner.Z * 8) / 8,
                );
                const snappedPosition = snappedMinCorner.add(snappedSize.div(2));
                child.Size = snappedSize;
                child.Position = snappedPosition;
            }
        }
        modelClone.Parent = Workspace;

        return <Fragment />;
    },
);
