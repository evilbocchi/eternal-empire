import { loadAnimation } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { TweenService, Workspace } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import { playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";

/**
 * Black overlay component for the intro sequence
 */
function IntroBlackOverlay({ transparency }: { transparency: number }) {
    return (
        <frame
            Size={new UDim2(1, 0, 1, 0)}
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BackgroundTransparency={transparency}
            BorderSizePixel={0}
            ZIndex={1000}
        />
    );
}

/**
 * Story for previewing the intro sequence where the player wakes up
 */
export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            autoPlay: true,
            showBlackOverlay: true,
            cameraSpeed: 1.0,
            resetCamera: false,
        },
    },
    (props) => {
        const [blackTransparency, setBlackTransparency] = useState(0);
        const [isPlaying, setIsPlaying] = useState(false);
        const animationRef = useRef<AnimationTrack | undefined>();
        const originalCameraRef = useRef<CFrame | undefined>();

        const performIntroPreview = () => {
            if (isPlaying) return;
            setIsPlaying(true);

            const humanoid = getPlayerCharacter()?.FindFirstChildOfClass("Humanoid");
            const camera = Workspace.CurrentCamera;

            if (!humanoid || !camera) {
                setIsPlaying(false);
                return;
            }

            // Store original camera state
            originalCameraRef.current = camera.CFrame;

            // Position player and setup transparency
            humanoid.RootPart!.CFrame = WAYPOINTS.NewBeginningsPlayerPos.CFrame;
            const head = humanoid.Parent?.WaitForChild("Head") as BasePart;
            const transparencyParts = [head];

            for (const descendant of head.GetDescendants()) {
                if (descendant.IsA("BasePart")) {
                    descendant.LocalTransparencyModifier = 1;
                    transparencyParts.push(descendant);
                }
            }
            head.LocalTransparencyModifier = 1;

            // Play sleeping animation
            const sleepingAnimation = loadAnimation(humanoid, 17789845379);
            sleepingAnimation?.Play();
            animationRef.current = sleepingAnimation;

            // Setup camera
            camera.CameraType = Enum.CameraType.Scriptable;
            camera.CFrame = WAYPOINTS.NewBeginningsCamera0.CFrame;

            // Start intro sequence with timing based on speed multiplier
            const speed = props.controls.cameraSpeed;

            setBlackTransparency(0); // Start with black screen

            // Camera movement sequence
            task.delay(2 / speed, () => {
                playSound("FabricRustle.mp3");
                TweenService.Create(camera, new TweenInfo(0.5 / speed), {
                    CFrame: WAYPOINTS.NewBeginningsCamera1.CFrame,
                }).Play();

                // Fade out black overlay
                if (props.controls.showBlackOverlay) {
                    setBlackTransparency(1);
                }
            });

            task.delay(2.96 / speed, () => {
                playSound("FabricRustle.mp3");
                TweenService.Create(camera, new TweenInfo(0.5 / speed), {
                    CFrame: WAYPOINTS.NewBeginningsCamera2.CFrame,
                }).Play();
            });

            task.delay(3.7 / speed, () => {
                playSound("FabricRustle.mp3");
                TweenService.Create(camera, new TweenInfo(0.5 / speed), {
                    CFrame: WAYPOINTS.NewBeginningsCamera3.CFrame,
                }).Play();
            });

            task.delay(5 / speed, () => {
                // Player wakes up
                playSound("JumpSwish.mp3");
                sleepingAnimation?.Stop();
                camera.CFrame = WAYPOINTS.NewBeginningsCamera4.CFrame;
                camera.CameraType = Enum.CameraType.Custom;
                humanoid.SetStateEnabled(Enum.HumanoidStateType.Jumping, true);

                // Restore player visibility
                for (const part of transparencyParts) {
                    part.LocalTransparencyModifier = 0;
                }
            });

            // Reset after sequence
            task.delay(8 / speed, () => {
                setIsPlaying(false);

                // Restore original camera if we stored it
                if (originalCameraRef.current) {
                    camera.CFrame = originalCameraRef.current;
                }
            });
        };

        const resetPreview = () => {
            setIsPlaying(false);
            setBlackTransparency(0);

            // Stop animation
            if (animationRef.current) {
                animationRef.current.Stop();
                animationRef.current = undefined;
            }

            // Reset camera
            const camera = Workspace.CurrentCamera;
            if (camera && originalCameraRef.current) {
                camera.CameraType = Enum.CameraType.Custom;
                camera.CFrame = originalCameraRef.current;
            }

            // Reset player transparency
            const humanoid = getPlayerCharacter()?.FindFirstChildOfClass("Humanoid");
            if (humanoid) {
                const head = humanoid.Parent?.WaitForChild("Head") as BasePart;
                head.LocalTransparencyModifier = 0;
                for (const descendant of head.GetDescendants()) {
                    if (descendant.IsA("BasePart")) {
                        descendant.LocalTransparencyModifier = 0;
                    }
                }
            }
        };

        // Auto-play effect
        useEffect(() => {
            if (props.controls.autoPlay && !isPlaying) {
                task.wait(1); // Small delay to allow setup
                performIntroPreview();
            }
        }, [props.controls.autoPlay]);

        // Reset camera effect
        useEffect(() => {
            if (props.controls.resetCamera) {
                resetPreview();
            }
        }, [props.controls.resetCamera]);

        return (
            <Fragment>
                {/* Story UI Controls */}
                <screengui ResetOnSpawn={false} ZIndexBehavior={Enum.ZIndexBehavior.Sibling}>
                    <frame
                        Size={new UDim2(0, 300, 0, 200)}
                        Position={new UDim2(0, 10, 0, 10)}
                        BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                        BackgroundTransparency={0.2}
                        BorderSizePixel={0}
                    >
                        <uilistlayout
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            Padding={new UDim(0, 5)}
                            FillDirection={Enum.FillDirection.Vertical}
                        />

                        <textlabel
                            Size={new UDim2(1, 0, 0, 30)}
                            BackgroundTransparency={1}
                            Text="Intro Sequence Preview"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={16}
                            Font={Enum.Font.SourceSansBold}
                            LayoutOrder={1}
                        />

                        <textbutton
                            Size={new UDim2(1, -10, 0, 30)}
                            Position={new UDim2(0, 5, 0, 0)}
                            BackgroundColor3={isPlaying ? Color3.fromRGB(200, 100, 100) : Color3.fromRGB(100, 200, 100)}
                            Text={isPlaying ? "Playing..." : "Play Sequence"}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            Font={Enum.Font.SourceSans}
                            LayoutOrder={2}
                            Event={{
                                MouseButton1Click: () => {
                                    if (!isPlaying) {
                                        performIntroPreview();
                                    }
                                },
                            }}
                        />

                        <textbutton
                            Size={new UDim2(1, -10, 0, 30)}
                            Position={new UDim2(0, 5, 0, 0)}
                            BackgroundColor3={Color3.fromRGB(200, 200, 100)}
                            Text="Reset"
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            Font={Enum.Font.SourceSans}
                            LayoutOrder={3}
                            Event={{
                                MouseButton1Click: resetPreview,
                            }}
                        />

                        <textlabel
                            Size={new UDim2(1, 0, 0, 60)}
                            BackgroundTransparency={1}
                            Text={`Speed: ${props.controls.cameraSpeed}x\nBlack Overlay: ${props.controls.showBlackOverlay ? "On" : "Off"}\nAuto-play: ${props.controls.autoPlay ? "On" : "Off"}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={12}
                            Font={Enum.Font.SourceSans}
                            TextXAlignment={Enum.TextXAlignment.Left}
                            TextYAlignment={Enum.TextYAlignment.Top}
                            LayoutOrder={4}
                        />
                    </frame>

                    {/* Black overlay for intro effect */}
                    {props.controls.showBlackOverlay && <IntroBlackOverlay transparency={blackTransparency} />}
                </screengui>
            </Fragment>
        );
    },
);
