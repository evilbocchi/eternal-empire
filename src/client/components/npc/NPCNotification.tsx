import React, { useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";

export default function NPCNotification({ prompt }: { prompt: ProximityPrompt }) {
    const imageRef = useRef<ImageLabel>();

    useEffect(() => {
        const update = () => {
            if (!imageRef.current) return;

            if (prompt.Enabled) {
                TweenService.Create(imageRef.current, new TweenInfo(0.3), { ImageTransparency: 0 }).Play();
            } else {
                TweenService.Create(imageRef.current, new TweenInfo(0.15), { ImageTransparency: 1 }).Play();
            }
        };
        const conn = prompt.GetPropertyChangedSignal("Enabled").Connect(update);
        update();
        return () => conn.Disconnect();
    }, []);

    return (
        <imagelabel
            ref={imageRef}
            BackgroundTransparency={1}
            Image={getAsset("assets/NPCNotification.png")}
            Size={new UDim2(1, 0, 1, 0)}
        />
    );
}
