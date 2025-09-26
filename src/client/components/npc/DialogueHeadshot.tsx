/**
 * @fileoverview React component for displaying NPC headshots in dialogue windows.
 *
 * Handles:
 * - Viewport frame setup for 3D model display
 * - Camera positioning and focusing on the NPC's head
 * - Model cloning and anchoring for viewport display
 */

import React, { useEffect, useRef } from "@rbxts/react";

interface DialogueHeadshotProps {
    /** The NPC model to display in the viewport */
    model?: Model;
}

export default function DialogueHeadshot({ model }: DialogueHeadshotProps) {
    const viewportRef = useRef<ViewportFrame>();

    useEffect(() => {
        if (!model || !viewportRef.current) return;

        const viewport = viewportRef.current;
        viewport.ClearAllChildren();

        const camera = new Instance("Camera");
        camera.Parent = viewport;
        viewport.CurrentCamera = camera;

        const clone = model.Clone();

        // Anchor all parts in the model
        for (const part of clone.GetChildren()) {
            if (part.IsA("BasePart")) {
                part.Anchored = true;
            }
        }

        clone.PivotTo(new CFrame(0, 0, 0));

        // Set camera to focus on the head of the model
        const head = (clone.FindFirstChild("Head") as BasePart) ?? clone.PrimaryPart;
        if (!head) {
            warn("NPC model does not have a Head or PrimaryPart.");
            return;
        }

        const headCFrame = head.CFrame;
        const distance = 1 + head.Size.Y;
        camera.CFrame = headCFrame.mul(CFrame.fromEulerAnglesXYZ(0, math.pi, 0)).mul(new CFrame(0, 0, distance));

        // Set the camera's field of view
        camera.FieldOfView = 70;
        clone.Parent = viewport;
    }, [model]);

    return (
        <viewportframe
            ref={viewportRef}
            key="ViewportFrame"
            AnchorPoint={new Vector2(1, 0.5)}
            BackgroundTransparency={1}
            Position={new UDim2(1, 0, 0, 0)}
            Size={new UDim2(0, 45, 0, 45)}
        />
    );
}
