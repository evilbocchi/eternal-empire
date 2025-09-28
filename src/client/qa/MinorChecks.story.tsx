import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";

/**
 * This story checks for unanchored parts and non-0/1 transparency parts in workspace descendants.
 */
export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        // Check for unanchored parts
        for (const v of Workspace.GetDescendants()) {
            if (v.IsA("BasePart") && !v.Anchored) {
                print(v);
            }
        }

        // Check for non-0/1 transparency parts
        for (const v of Workspace.GetDescendants()) {
            if (
                v.IsA("BasePart") &&
                v.Transparency !== 0 &&
                v.Transparency !== 1 &&
                v.Name !== "Antighost" &&
                v.Name !== "Laser"
            ) {
                print(v);
            }
        }

        // Snap models to baseplate (commented out, see Lua for reference)
        // const ITEM_MODELS = (() => {
        //     const itemModels: Record<string, Model> = {};
        //     const folder = Workspace.ItemModels;
        //     const findModels = (instance: Instance): Model[] => {
        //         let models: Model[] = [];
        //         for (const child of instance.GetChildren()) {
        //             if (child.IsA("Folder")) {
        //                 models = models.concat(findModels(child));
        //             } else if (child.IsA("Model")) {
        //                 models.push(child as Model);
        //             }
        //         }
        //         return models;
        //     };
        //     const served = findModels(folder);
        //     for (const model of served) {
        //         itemModels[model.Name] = model;
        //     }
        //     return itemModels;
        // })();
        // const BuildBounds = require(game.ReplicatedStorage.TS.utils.BuildBounds);
        // const bb = BuildBounds.new(Workspace.Baseplate);
        // for (const [name, v] of pairs(ITEM_MODELS)) {
        //     const pp = v.PrimaryPart;
        //     if (!pp) {
        //         warn(`no pp for ${name}`);
        //         continue;
        //     }
        //     (v as Model).PivotTo(bb.snap(pp.Size, pp.Position, 0));
        // }

        return <Fragment />;
    },
);
