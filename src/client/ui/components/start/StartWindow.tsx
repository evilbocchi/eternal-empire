import React, { Fragment, useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { RunService, TweenService } from "@rbxts/services";
import SingleDocumentManager from "client/ui/components/sidebar/SingleDocumentManager";
import AboutWindow from "client/ui/components/start/AboutWindow";
import EmpiresWindow from "client/ui/components/start/EmpiresWindow";
import MenuOption from "client/ui/components/start/MenuOption";
import DocumentManager, { useDocument } from "client/ui/components/window/DocumentManager";
import SoundManager from "client/ui/SoundManager";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";

/**
 * Main start window component that handles the title screen, empire selection, and about page
 */
export default function StartWindow() {
    const sideBackgroundRef = useRef<ImageLabel>();
    const logoRef = useRef<ImageLabel>();
    const mainMenuRef = useRef<Frame>();
    const { visible } = useDocument({ id: "Start" });
    const [currentView, setCurrentView] = useState<"main" | "empires" | "about" | "none">("main");
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasEnteredScreen, setHasEnteredScreen] = useState(false);
    const firstRenderTime = useRef<number>(tick());

    // Helper function to determine if we should use fast animations
    const shouldUseFastAnimations = useCallback(() => {
        const timeSinceFirstRender = tick() - firstRenderTime.current;
        return timeSinceFirstRender > 5; // Fast mode after 5 seconds
    }, []);

    // Animation entrance effect when component becomes visible
    useEffect(() => {
        if (visible && !hasEnteredScreen) {
            setHasEnteredScreen(true);

            // Check if enough time has passed since first render (5+ seconds = fast mode)
            const timeSinceFirstRender = tick() - firstRenderTime.current;
            const fast = timeSinceFirstRender > 5;

            // Set initial positions for entrance animation
            if (sideBackgroundRef.current) {
                sideBackgroundRef.current.Position = new UDim2(-0.5, 0, 0.5, 0);
            }
            if (logoRef.current) {
                logoRef.current.Position = new UDim2(-0.15, 0, 0.05, 0);
                logoRef.current.Rotation = -80;
            }

            // Animate background entrance
            const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Circular, Enum.EasingDirection.Out);
            if (sideBackgroundRef.current) {
                TweenService.Create(sideBackgroundRef.current, tweenInfo, {
                    Position: new UDim2(0, 0, 0.5, 0),
                }).Play();
            }

            // Animate logo entrance with delay (reduced if fast)
            const logoDelay = fast ? 0.2 : 0.8;
            task.delay(logoDelay, () => {
                if (logoRef.current) {
                    TweenService.Create(logoRef.current, tweenInfo, {
                        Position: new UDim2(0.15, 0, 0.05, 0),
                        Rotation: 0,
                    }).Play();
                }
            });
        }
    }, [visible, hasEnteredScreen]);

    useEffect(() => {
        let pulsed = false;
        const connection = RunService.Heartbeat.Connect(() => {
            if (SoundManager.START_MUSIC.TimePosition > 3.5 && !pulsed && logoRef.current) {
                pulsed = true;
                const createWave = () => {
                    const wave = logoRef.current!.Clone();
                    wave.ClearAllChildren();
                    wave.Position = new UDim2(0.5, 0, 0.5, 0);
                    wave.AnchorPoint = new Vector2(0.5, 0.5);
                    wave.Size = new UDim2(1, 0, 1, 0);
                    wave.Parent = logoRef.current;
                    TweenService.Create(wave, new TweenInfo(0.5), {
                        Size: new UDim2(1.15, 5, 1.15, 5),
                        ImageTransparency: 1,
                    }).Play();
                };
                createWave();
            }
        });
        task.delay(30, () => connection?.Disconnect());

        return () => connection.Disconnect();
    }, []);

    // Handle smooth transitions between views
    const transitionToView = useCallback(
        (view: "main" | "empires" | "about" | "none") => {
            if (isAnimating) return;

            setIsAnimating(true);
            playSound("EmphasisMenuSelect.mp3", undefined, (sound) => (sound.Volume = 0.35));

            // If transitioning away from main, hide title screen with animation
            if (currentView === "main" && view !== "main") {
                const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Circular, Enum.EasingDirection.Out);

                if (sideBackgroundRef.current) {
                    TweenService.Create(sideBackgroundRef.current, tweenInfo, {
                        Position: new UDim2(-0.5, 0, 0.5, 0),
                    }).Play();
                }

                if (logoRef.current) {
                    TweenService.Create(logoRef.current, tweenInfo, {
                        Position: new UDim2(-0.15, 0, 0.05, 0),
                        Rotation: -80,
                    }).Play();
                }
            }

            // If transitioning back to main, show title screen with animation
            if (view === "main" && currentView !== "main") {
                task.delay(0.2, () => {
                    const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Circular, Enum.EasingDirection.Out);

                    if (sideBackgroundRef.current) {
                        TweenService.Create(sideBackgroundRef.current, tweenInfo, {
                            Position: new UDim2(0, 0, 0.5, 0),
                        }).Play();
                    }

                    if (logoRef.current) {
                        TweenService.Create(logoRef.current, tweenInfo, {
                            Position: new UDim2(0.15, 0, 0.05, 0),
                            Rotation: 0,
                        }).Play();
                    }
                });

                // Reset the entrance state so animations can trigger again (but fast)
                setHasEnteredScreen(false);
            }

            // Change view state
            setCurrentView(view);

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

    const handleBackToMain = useCallback(() => {
        transitionToView("main");
    }, [transitionToView]);

    if (!visible) {
        return <Fragment />;
    }

    return (
        <Fragment>
            {/* Background Elements */}
            <imagelabel
                ref={sideBackgroundRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BackgroundTransparency={0}
                BorderSizePixel={0}
                Image={getAsset("assets/start/SideBackground.png")}
                ImageTransparency={0.7}
                Position={new UDim2(0, 0, 0.5, 0)}
                Rotation={5}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(0.3, 0, 2, 0)}
                TileSize={new UDim2(0, 800, 0, 800)}
                ZIndex={-1}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(248, 54, 0)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(254, 140, 0)),
                        ])
                    }
                    Rotation={-97}
                />
                <imagelabel
                    BackgroundTransparency={1}
                    BorderSizePixel={0}
                    Image={getAsset("assets/GridHighContrast.png")}
                    ImageColor3={Color3.fromRGB(0, 0, 0)}
                    ImageTransparency={0.8}
                    Interactable={false}
                    Rotation={180}
                    ScaleType={Enum.ScaleType.Tile}
                    Size={new UDim2(1, 2, 1, 2)}
                    TileSize={new UDim2(0, 200, 0, 200)}
                >
                    <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3} />
                </imagelabel>
            </imagelabel>

            {/* Logo */}
            <imagelabel
                ref={logoRef}
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                Image={getAsset("assets/LogoSmall.png")}
                Position={new UDim2(0.15, 0, 0.05, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(0.3, 0, 0.25, 0)}
                TileSize={new UDim2(0, 200, 0, 200)}
                ZIndex={1}
            />

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
                            transitionToView("empires");
                        }}
                        height={70}
                        shouldAnimate={hasEnteredScreen}
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
                            SingleDocumentManager.open("Settings");
                        }}
                        height={60}
                        shouldAnimate={hasEnteredScreen}
                        animationDelay={0.2}
                        fast={shouldUseFastAnimations()}
                    />

                    <MenuOption
                        label="About"
                        gradientColors={[Color3.fromRGB(34, 189, 255), Color3.fromRGB(8, 127, 255)]}
                        onClick={() => {
                            transitionToView("about");
                        }}
                        height={60}
                        shouldAnimate={hasEnteredScreen}
                        animationDelay={0.4}
                        fast={shouldUseFastAnimations()}
                    />
                </frame>
            )}

            {/* Empires Selection View */}
            {currentView === "empires" && <EmpiresWindow onClose={handleBackToMain} />}

            {/* About View */}
            {currentView === "about" && <AboutWindow onClose={handleBackToMain} />}
        </Fragment>
    );
}
