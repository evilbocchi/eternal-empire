import React, { useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";

export interface SparkData {
    id: string;
    position: UDim2;
    velocity: Vector2;
    rotation: number;
}

export default function ClickSpark({ spark, onComplete }: { spark: SparkData; onComplete: (id: string) => void }) {
    const frameRef = useRef<ImageLabel>();
    const animationStarted = useRef(false);

    useEffect(() => {
        if (!frameRef.current || animationStarted.current) return;

        animationStarted.current = true;
        const imageLabel = frameRef.current;

        // Set initial properties
        imageLabel.ImageTransparency = 0;
        const width = math.random(9, 15);
        imageLabel.Size = new UDim2(0, width, 0, width);
        imageLabel.Rotation = spark.rotation;

        // Calculate end position based on velocity
        const startPos = spark.position;
        const endX = startPos.X.Offset + spark.velocity.X * 100; // Scale velocity
        const endY = startPos.Y.Offset + spark.velocity.Y * 100;
        const endPosition = new UDim2(0, endX, 0, endY);

        // Create tween info
        const tweenInfo = new TweenInfo(1.2, Enum.EasingStyle.Quart, Enum.EasingDirection.Out, 0, false, 0);

        // Create tweens for transparency, position, and rotation
        const transparencyTween = TweenService.Create(imageLabel, tweenInfo, {
            ImageTransparency: 1,
        });

        const positionTween = TweenService.Create(imageLabel, tweenInfo, {
            Position: endPosition,
        });

        const rotationTween = TweenService.Create(imageLabel, tweenInfo, {
            Rotation: spark.rotation + 360, // Full rotation
            Size: new UDim2(0, width * 0.5, 0, width * 0.5),
        });

        // Start tweens
        transparencyTween.Play();
        positionTween.Play();
        rotationTween.Play();

        // Handle completion
        const connection = transparencyTween.Completed.Connect(() => {
            onComplete(spark.id);
        });

        return () => {
            connection.Disconnect();
            transparencyTween.Cancel();
            positionTween.Cancel();
            rotationTween.Cancel();
        };
    }, [spark.id]); // Removed onComplete from dependencies

    return (
        <imagelabel
            ref={frameRef}
            BackgroundTransparency={1}
            Image={getAsset("assets/Spark.png")}
            Position={spark.position}
            AnchorPoint={new Vector2(0.5, 0.5)}
            ZIndex={1000}
        />
    );
}
