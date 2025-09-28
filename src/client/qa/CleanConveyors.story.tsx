import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";

function cleanModel(model: Model) {
    let cleaned = false;
    for (const child of model.GetChildren()) {
        if (child.Name === "Conveyor") {
            for (const attachment of child.GetChildren()) {
                if (
                    attachment.Name === "ClientObject" ||
                    attachment.Name === "Speed" ||
                    attachment.Name === "ClientObjectScript"
                ) {
                    attachment.Destroy();
                    cleaned = true;
                    continue;
                }
                if (attachment.Name !== "Attachment") continue;
                const beam = attachment.FindFirstChildOfClass("Beam");
                if (beam) {
                    cleaned = true;
                    attachment.Name = "Attachment0";
                    beam.Destroy();
                } else {
                    cleaned = true;
                    attachment.Name = "Attachment1";
                }
            }
        }
    }
    if (cleaned) {
        print(model);
    }
}

/**
 * This story cleans models in the workspace according to conveyor/attachment rules.
 */
export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        for (const v of Workspace.GetChildren()) {
            if (!v.IsA("Model")) continue;

            if (!v.PrimaryPart) {
                const hitbox = v.FindFirstChild("Hitbox");
                if (hitbox && hitbox.IsA("BasePart")) {
                    v.PrimaryPart = hitbox;
                } else {
                    continue;
                }
            }

            if (v.PrimaryPart && v.PrimaryPart.Name === "Hitbox") {
                cleanModel(v);
            }
        }

        return <Fragment />;
    },
);
