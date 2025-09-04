import React, { useState, useRef, useCallback, useEffect } from "@rbxts/react";
import { GuiService, UserInputService, RunService } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import ClickSpark, { SparkData } from "client/ui/components/effect/ClickSpark";

export default function ClickSparkManager() {
    const [sparks, setSparks] = useState<SparkData[]>([]);
    const [isMouseHeld, setIsMouseHeld] = useState(false);
    const intervalRef = useRef<RBXScriptConnection | undefined>();
    const lastMousePosition = useRef<Vector2 | undefined>();

    const getMousePosition = useCallback(() => {
        const mouse = LOCAL_PLAYER.GetMouse();
        const [topLeftCorner] = GuiService.GetGuiInset();
        return new Vector2(mouse.X, mouse.Y).add(topLeftCorner);
    }, []);

    const handleSparkComplete = useCallback((sparkId: string) => {
        setSparks((prev) => prev.filter((spark) => spark.id !== sparkId));
    }, []);

    const createSparks = useCallback((mousePosition: Vector2) => {
        // Create multiple spark particles (3-5 particles for continuous generation)
        const particleCount = math.random(3, 5);
        const newSparks: SparkData[] = [];

        for (let i = 0; i < particleCount; i++) {
            // Random angle for each particle
            const angle = math.random() * math.pi * 2;
            const speed = math.random() * 0.3 + 0.3;

            // Calculate velocity components
            const velocityX = math.cos(angle) * speed;
            const velocityY = math.sin(angle) * speed;

            const sparkId = `spark_${tick()}_${i}`;
            const newSpark: SparkData = {
                id: sparkId,
                position: new UDim2(0, mousePosition.X, 0, mousePosition.Y),
                velocity: new Vector2(velocityX, velocityY),
                rotation: math.random() * 360, // Random initial rotation
            };

            newSparks.push(newSpark);
        }

        setSparks((prev) => [...prev, ...newSparks]);
    }, []);

    useEffect(() => {
        const inputBeganConnection = UserInputService.InputBegan.Connect((input) => {
            if (
                input.UserInputType === Enum.UserInputType.MouseButton1 ||
                input.UserInputType === Enum.UserInputType.Touch
            ) {
                setIsMouseHeld(true);

                const mousePosition = getMousePosition();
                lastMousePosition.current = mousePosition;

                // Create initial sparks
                createSparks(mousePosition);
            }
        });

        const inputEndedConnection = UserInputService.InputEnded.Connect((input) => {
            if (
                input.UserInputType === Enum.UserInputType.MouseButton1 ||
                input.UserInputType === Enum.UserInputType.Touch
            ) {
                setIsMouseHeld(false);
                lastMousePosition.current = undefined;
            }
        });

        return () => {
            inputBeganConnection.Disconnect();
            inputEndedConnection.Disconnect();
        };
    }, [createSparks]);

    // Handle continuous spark generation while mouse is held
    useEffect(() => {
        if (isMouseHeld) {
            // Generate sparks every 0.1 seconds while mouse is held
            intervalRef.current = RunService.Heartbeat.Connect(() => {
                const mousePosition = getMousePosition();

                // Only generate sparks if mouse has moved and every few frames to avoid overwhelming
                if (lastMousePosition.current && tick() % 0.1 < 0.017) {
                    // Approximately every 0.1 seconds
                    const distance = mousePosition.sub(lastMousePosition.current).Magnitude;

                    // Only create sparks if mouse has moved more than 5 pixels
                    if (distance > 5) {
                        createSparks(mousePosition);
                        lastMousePosition.current = mousePosition;
                    }
                }
            });
        } else {
            if (intervalRef.current) {
                intervalRef.current.Disconnect();
                intervalRef.current = undefined;
            }
        }

        return () => {
            if (intervalRef.current) {
                intervalRef.current.Disconnect();
                intervalRef.current = undefined;
            }
        };
    }, [isMouseHeld, createSparks]);

    return (
        <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} ZIndex={5}>
            {sparks.map((spark) => (
                <ClickSpark key={spark.id} spark={spark} onComplete={handleSparkComplete} />
            ))}
        </frame>
    );
}
