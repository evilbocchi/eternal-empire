import React, { Fragment, useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService, Workspace } from "@rbxts/services";
import SingleDocumentManager from "client/components/sidebar/SingleDocumentManager";
import AboutWindow from "client/components/start/AboutWindow";
import EmpiresWindow from "client/components/start/EmpiresWindow";
import MenuOption from "client/components/start/MenuOption";
import performNewBeginningsWakeUp from "client/components/start/performNewBeginningsWakeUp";
import DocumentManager, { useDocument } from "client/components/window/DocumentManager";
import { LOCAL_PLAYER } from "client/constants";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMonoBold } from "shared/asset/GameFonts";
import { CAMERA } from "shared/constants";
import Packets from "shared/Packets";
import MinerHavenNameplate from "shared/world/nodes/MinerHavenNameplate";
import StartCamera from "shared/world/nodes/StartCamera";

/**
 * Main start window component that handles the title screen, empire selection, and about page
 */
export default function TitleScreen({ fastTransitions = false }: { fastTransitions?: boolean }) {
    const logoRef = useRef<ImageLabel>();
    const mainMenuRef = useRef<Frame>();
    const { visible, setVisible } = useDocument({ id: "Title" });
    const [currentView, setCurrentView] = useState<"main" | "empires" | "about" | "none">("main");
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasEnteredScreen, setHasEnteredScreen] = useState(false);
    const firstRenderTime = useRef<number>(fastTransitions ? 0 : os.clock());

    // Helper function to determine if we should use fast animations
    const shouldUseFastAnimations = useCallback(() => {
        const timeSinceFirstRender = os.clock() - firstRenderTime.current;
        return timeSinceFirstRender > 5; // Fast mode after 5 seconds
    }, []);

    const logoTweenInInfo = new TweenInfo(1, Enum.EasingStyle.Back, Enum.EasingDirection.Out);

    // Animation entrance effect when component becomes visible
    useEffect(() => {
        if (visible && !hasEnteredScreen) {
            setHasEnteredScreen(true);

            // Set initial positions for entrance animation
            if (logoRef.current) {
                logoRef.current.Position = new UDim2(1.25, -50, 0.5, 0);
                logoRef.current.Rotation = 40;
            }

            task.delay(shouldUseFastAnimations() ? 0.2 : 0.8, () => {
                if (logoRef.current) {
                    TweenService.Create(logoRef.current, logoTweenInInfo, {
                        Position: new UDim2(1, 0, 0.5, 0),
                        Rotation: 0,
                    }).Play();
                }
            });
        }
    }, [visible, hasEnteredScreen]);

    // Camera transition effect - cycles through StartCamera scenes every 10 seconds
    useEffect(() => {
        if (!visible) return;

        CAMERA.CameraType = Enum.CameraType.Scriptable;
        CAMERA.CFrame = StartCamera.waitForInstance().CFrame;

        return () => {
            CAMERA.CameraType = Enum.CameraType.Custom;
        };
    }, [visible]);

    // Handle smooth transitions between views
    const transitionToView = useCallback(
        (view: "main" | "empires" | "about" | "none") => {
            if (isAnimating) return;

            setCurrentView(view);
            setIsAnimating(true);

            // If transitioning away from main, hide title screen with animation
            if (currentView === "main" && view !== "main") {
                const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Circular, Enum.EasingDirection.Out);
                if (logoRef.current) {
                    TweenService.Create(logoRef.current, tweenInfo, {
                        Position: new UDim2(1.25, -50, 0.5, 0),
                        Rotation: 40,
                    }).Play();
                }
            }

            // If transitioning back to main, show title screen with animation
            if (view === "main" && currentView !== "main") {
                if (logoRef.current) {
                    TweenService.Create(logoRef.current, logoTweenInInfo, {
                        Position: new UDim2(1, 0, 0.5, 0),
                        Rotation: 0,
                    }).Play();
                }

                // Only reset the entrance state if NOT coming from empires (to prevent menu re-animation)
                if (currentView !== "empires") {
                    setHasEnteredScreen(false);
                }
            }

            task.delay(0.5, () => setIsAnimating(false));
        },
        [isAnimating, currentView],
    );

    useEffect(() => {
        if (!visible) return;

        const connection = DocumentManager.visibilityChanged.connect((id, isVisible) => {
            if (id !== "Settings") return;
            if (isVisible) {
                transitionToView("none");
            } else {
                transitionToView("main");
            }
        });

        return () => connection.Disconnect();
    }, [visible, transitionToView]);

    // Cleanup camera when component becomes invisible
    useEffect(() => {
        if (!visible) {
            // Reset camera to custom mode when leaving start window
            CAMERA.CameraType = Enum.CameraType.Custom;
        }
    }, [visible]);

    const handleBackToMain = useCallback(() => {
        transitionToView("main");
    }, [transitionToView]);

    if (!visible) {
        return <Fragment />;
    }

    const empireName = Packets.empireName.get();

    return (
        <Fragment>
            <surfacegui
                Adornee={MinerHavenNameplate.waitForInstance(20)}
                ClipsDescendants={true}
                Face={Enum.NormalId.Top}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={empireName === "no name" ? LOCAL_PLAYER?.Name : empireName}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={100}
                    TextWrapped={true}
                >
                    <uiscale Scale={3} />
                    <uistroke Thickness={2} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.45, Color3.fromRGB(170, 255, 255)),
                                new ColorSequenceKeypoint(0.55, Color3.fromRGB(110, 161, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                            ])
                        }
                        Rotation={90}
                    />
                </textlabel>
            </surfacegui>

            {/* Logo */}
            <imagelabel
                ref={logoRef}
                AnchorPoint={new Vector2(1, 0.5)}
                BackgroundTransparency={1}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(1, 0, 0.2, 50)}
                Image={getAsset("assets/brand/Wordmark.png")}
            >
                <uiaspectratioconstraint AspectRatio={1.5} />
            </imagelabel>

            {/* Main Menu View */}
            {currentView === "main" && (
                <frame
                    ref={mainMenuRef}
                    BackgroundTransparency={1}
                    Position={new UDim2(0, 0, 0.4, 0)}
                    Size={new UDim2(1, 0, 0.55, 0)}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        VerticalFlex={Enum.UIFlexAlignment.Fill}
                    />

                    <MenuOption
                        label="Play"
                        gradientColors={[Color3.fromRGB(85, 255, 127), Color3.fromRGB(5, 170, 60)]}
                        onClick={() => {
                            playSound("EmphasisMenuSelect.mp3", undefined, (sound) => (sound.Volume = 0.4));
                            transitionToView("empires");
                        }}
                        height={70}
                        animationDelay={0}
                        fast={shouldUseFastAnimations()}
                    />

                    {/** Spacer */}
                    <frame Size={new UDim2(1, 0, 0, 35)} BackgroundTransparency={1}>
                        <uiflexitem FlexMode={Enum.UIFlexMode.Shrink} />
                    </frame>

                    <MenuOption
                        label="Settings"
                        gradientColors={[Color3.fromRGB(172, 172, 172), Color3.fromRGB(102, 102, 102)]}
                        onClick={() => {
                            playSound("EmphasisMenuSelect.mp3", undefined, (sound) => (sound.Volume = 0.35));
                            SingleDocumentManager.open("Settings");
                        }}
                        height={60}
                        animationDelay={0.2}
                        fast={shouldUseFastAnimations()}
                    />

                    <MenuOption
                        label="About"
                        gradientColors={[Color3.fromRGB(34, 189, 255), Color3.fromRGB(8, 127, 255)]}
                        onClick={() => {
                            playSound("EmphasisMenuSelect.mp3", undefined, (sound) => (sound.Volume = 0.35));
                            transitionToView("about");
                        }}
                        height={60}
                        animationDelay={0.4}
                        fast={shouldUseFastAnimations()}
                    />
                </frame>
            )}

            {/* Empires Selection View */}
            {currentView === "empires" && (
                <EmpiresWindow
                    onClose={handleBackToMain}
                    exitStart={() => {
                        setCurrentView("none");
                        setVisible(false);
                        const camera = Workspace.CurrentCamera;
                        if (camera) {
                            camera.CameraType = Enum.CameraType.Custom;
                        }
                    }}
                />
            )}

            {/* About View */}
            {currentView === "about" && <AboutWindow onClose={handleBackToMain} />}
        </Fragment>
    );
}
