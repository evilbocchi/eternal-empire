import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";

/**
 * This story prints all poly parts in workspace descendants that are collidable and not named Ghost/Decoration.
 */
export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        for (const v of Workspace.GetDescendants()) {
            const isPoly =
                v.IsA("WedgePart") ||
                v.IsA("CornerWedgePart") ||
                (v.IsA("Part") &&
                    (v.Shape === Enum.PartType.Wedge ||
                        v.Shape === Enum.PartType.CornerWedge ||
                        v.Shape === Enum.PartType.Cylinder));
            if (isPoly && v.Name !== "Ghost" && v.Name !== "Decoration" && v.CanCollide) {
                print(v);
            }
        }
        return <Fragment />;
    },
);
