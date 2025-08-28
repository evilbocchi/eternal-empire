/**
 * @fileoverview Standalone Quest Window component that replaces the adaptive tab implementation
 * 
 * This is the new independent quest window that shows/hides without relying on the 
 * adaptive tab system. It includes its own positioning, animations, and window chrome.
 */

import React, { useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import QuestWindow from "shared/ui/components/quest/QuestWindow";
import WindowCloseButton from "shared/ui/components/window/WindowCloseButton";
import WindowTitle from "shared/ui/components/window/WindowTitle";

export interface StandaloneQuestWindowProps {
    visible?: boolean;
    onClose?: () => void;
}

export default function StandaloneQuestWindow({
    visible = false,
    onClose
}: StandaloneQuestWindowProps) {
    const frameContentRef = useRef<Frame>();
    const [previousVisible, setPreviousVisible] = useState(visible);

    useEffect(() => {
        const action = (visible && !previousVisible) ? "open" : (!visible && previousVisible) ? "close" : undefined;

        const frameContent = frameContentRef.current!;
        const below = new UDim2(0.5, 0, 0.5, 30);
        const middle = new UDim2(0.5, 0, 0.5, 0);
        
        if (action === "open")
            frameContent.Visible = true;

        // Handle animation
        if (action) {
            frameContent.Position = action === "open" ? below : middle;

            const tweenInfo = action === "open" ? new TweenInfo(0.2) : new TweenInfo(0.1, Enum.EasingStyle.Linear);
            const tween = TweenService.Create(frameContent, tweenInfo, {
                Position: action === "open" ? middle : below
            });

            tween.Play();
            tween.Completed.Connect(() => {
                frameContent.Visible = visible;
            });
        }
        setPreviousVisible(visible);
    }, [visible, previousVisible]);

    return (
        <frame
            key="StandaloneQuestWindow"
            ref={frameContentRef}
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(13, 13, 13)}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            Selectable={true}
            Size={new UDim2(0.8, 0, 0.8, -50)}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Visible={false}
        >
            <uisizeconstraint
                MaxSize={new Vector2(900, 700)}
                MinSize={new Vector2(600, 400)}
            />
            
            <WindowTitle icon={getAsset("assets/Quests.png")} title="Quests" />
            <WindowCloseButton onClick={() => onClose?.()} />
            
            {/* Main quest content */}
            <frame
                key="QuestContent"
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.5, 15)}
                Size={new UDim2(0.95, 0, 0.9, -30)}
            >
                <QuestWindow />
            </frame>
            
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} />
        </frame>
    );
}