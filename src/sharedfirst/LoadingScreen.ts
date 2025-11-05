import { Players, TweenService } from "@rbxts/services";

namespace LoadingScreen {
    let guiContainer: ScreenGui | undefined;
    let label: TextLabel | undefined;
    let backdrop: ImageLabel | undefined;
    let clockFrame: Frame | undefined;
    let longHand: ImageLabel | undefined;
    let shortHand: ImageLabel | undefined;
    let clockUpdater: thread | undefined;
    let pulseFrame: Frame | undefined;
    let pulseTween: Tween | undefined;

    function createGuiIfNeeded(screenGuiOverride?: ScreenGui) {
        if (guiContainer) return;

        if (screenGuiOverride) {
            guiContainer = screenGuiOverride;
        } else {
            const player = Players.LocalPlayer;
            if (!player) return;

            const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
            guiContainer = new Instance("ScreenGui") as ScreenGui;
            guiContainer.Name = "LoadingScreen";
            guiContainer.ResetOnSpawn = false;
            guiContainer.IgnoreGuiInset = true;
            guiContainer.DisplayOrder = 1000;
            guiContainer.Parent = playerGui;
        }

        backdrop = new Instance("ImageLabel");
        backdrop.AnchorPoint = new Vector2(0.5, 0.5);
        backdrop.Size = new UDim2(1, 0, 1, 0);
        backdrop.SizeConstraint = Enum.SizeConstraint.RelativeXX;
        backdrop.Position = new UDim2(0.5, 0, 0.5, 0);
        backdrop.BackgroundColor3 = new Color3(0, 0, 0);
        backdrop.BorderSizePixel = 0;
        backdrop.ZIndex = 1;
        backdrop.Image = "rbxassetid://92129879849075";
        backdrop.ImageTransparency = 0.925;
        backdrop.ScaleType = Enum.ScaleType.Fit;
        // Add UICorner for animating roundness
        const backdropCorner = new Instance("UICorner");
        backdropCorner.CornerRadius = new UDim(0, 0); // Start square
        backdropCorner.Name = "BackdropCorner";
        backdropCorner.Parent = backdrop;
        backdrop.Parent = guiContainer;

        // Clock Frame (center)
        clockFrame = new Instance("Frame");
        clockFrame.AnchorPoint = new Vector2(0.5, 0.5);
        clockFrame.Position = new UDim2(0.5, 0, 0.5, 0);
        clockFrame.Size = new UDim2(0, 192, 0, 192);
        clockFrame.BackgroundTransparency = 1;
        clockFrame.ZIndex = 3;
        clockFrame.Parent = guiContainer;

        // Pulse Frame (center, for glow effect)
        pulseFrame = new Instance("Frame");
        pulseFrame.AnchorPoint = new Vector2(0.5, 0.5);
        pulseFrame.Position = new UDim2(0.5, 0, 0.5, 0);
        pulseFrame.Size = new UDim2(0, 32, 0, 32);
        pulseFrame.BackgroundColor3 = new Color3(1, 1, 1);
        pulseFrame.BackgroundTransparency = 1;
        pulseFrame.BorderSizePixel = 0;
        pulseFrame.ZIndex = 6;
        pulseFrame.Parent = clockFrame;
        const uiCorner = new Instance("UICorner");
        uiCorner.CornerRadius = new UDim(1, 0);
        uiCorner.Parent = pulseFrame;

        // Short hand (hour)
        shortHand = new Instance("ImageLabel");
        shortHand.AnchorPoint = new Vector2(0.5, 0.5); // bottom center
        shortHand.Position = new UDim2(0.5, 0, 0.5, 0);
        shortHand.Size = new UDim2(0, 80, 0, 80);
        shortHand.BackgroundTransparency = 1;
        shortHand.Image = "rbxassetid://8966915998";
        shortHand.ScaleType = Enum.ScaleType.Fit;
        shortHand.ZIndex = 4;
        shortHand.Parent = clockFrame;

        // Long hand (minute)
        longHand = new Instance("ImageLabel");
        longHand.AnchorPoint = new Vector2(0.5, 0.5); // bottom center
        longHand.Position = new UDim2(0.5, 0, 0.5, 0);
        longHand.Size = new UDim2(0, 96, 0, 96);
        longHand.BackgroundTransparency = 1;
        longHand.Image = "rbxassetid://8966886535";
        longHand.ScaleType = Enum.ScaleType.Fit;
        longHand.ZIndex = 5;
        longHand.Parent = clockFrame;

        // Label
        label = new Instance("TextLabel");
        label.AnchorPoint = new Vector2(0.5, 0.5);
        label.BackgroundTransparency = 1;
        label.Position = new UDim2(0.5, 0, 0.5, 100);
        label.Size = new UDim2(0.5, 0, 0, 24);
        label.TextColor3 = new Color3(1, 1, 1);
        label.TextScaled = true;
        label.TextWrapped = true;
        label.TextXAlignment = Enum.TextXAlignment.Center;
        label.TextYAlignment = Enum.TextYAlignment.Center;
        label.Font = Enum.Font.Merriweather;
        label.ZIndex = 2;
        label.Parent = guiContainer;

        guiContainer.Enabled = false;
    }

    let lastIntersected = false;
    function updateClock() {
        if (!clockFrame || !longHand || !shortHand) return;
        const now = os.clock() * 1200; // Accelerate time by 1200x
        const minutes = (now / 60) % 60;
        const hours = (now / 3600) % 12;
        const longRot = (minutes / 60) * 360;
        const shortRot = (hours / 12) * 360;
        longHand.Rotation = longRot;
        shortHand.Rotation = shortRot;

        // Detect intersection (within 2 degrees)
        let diff = math.abs(((longRot - shortRot + 180) % 360) - 180);
        const intersecting = diff < 2;
        if (intersecting && !lastIntersected) {
            pulseCenter();
        }
        lastIntersected = intersecting;
    }

    function pulseCenter() {
        if (!pulseFrame) return;
        // Reset if already pulsing
        if (pulseTween) {
            pulseTween.Cancel();
            pulseTween = undefined;
        }
        pulseFrame.BackgroundTransparency = 0.8;
        pulseFrame.Size = new UDim2(0, 32, 0, 32);
        pulseFrame.Visible = true;
        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
        const tween = TweenService.Create(pulseFrame, tweenInfo, {
            Size: new UDim2(0, 128, 0, 128),
            BackgroundTransparency: 1,
        });
        pulseTween = tween;
        tween.Play();
        tween.Completed.Once(() => {
            if (pulseFrame) pulseFrame.Visible = false;
            pulseTween = undefined;
        });
    }

    export function showLoadingScreen(text: string, skipTween?: boolean, screenGuiOverride?: ScreenGui) {
        createGuiIfNeeded(screenGuiOverride);
        if (!guiContainer || !label) return;
        label.Text = text ?? "";
        guiContainer.Enabled = true;

        // Fade in all children
        if (!skipTween) {
            backdrop!.Size = new UDim2(0, 0, 0, 0);
            // Animate UICorner to square (0) when opening
            const backdropCorner = backdrop!.FindFirstChild("BackdropCorner") as UICorner;
            if (backdropCorner) {
                backdropCorner.CornerRadius = new UDim(1, 0);
                TweenService.Create(
                    backdropCorner,
                    new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                    {
                        CornerRadius: new UDim(0, 0),
                    },
                ).Play();
            }

            const tweenInfo = new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

            TweenService.Create(backdrop!, tweenInfo, {
                BackgroundTransparency: 0,
                ImageTransparency: 0.925,
                Size: new UDim2(1, 0, 1, 0),
            }).Play();
            TweenService.Create(label, tweenInfo, { TextTransparency: 0, TextStrokeTransparency: 0 }).Play();
            TweenService.Create(longHand!, tweenInfo, { ImageTransparency: 0 }).Play();
            TweenService.Create(shortHand!, tweenInfo, { ImageTransparency: 0 }).Play();
        }

        // Start clock update loop
        if (!clockUpdater && clockFrame && longHand && shortHand) {
            clockUpdater = task.spawn(() => {
                while (guiContainer && guiContainer.Enabled) {
                    updateClock();
                    task.wait();
                }
                clockUpdater = undefined;
            });
        }
    }

    export function hideLoadingScreen(tweenDuration = 0.4) {
        if (!guiContainer) return;

        // Fade out all children
        const tweenInfo = new TweenInfo(tweenDuration, Enum.EasingStyle.Quad, Enum.EasingDirection.In);

        // Animate UICorner to round (0.5) when closing
        const backdropCorner = backdrop!.FindFirstChild("BackdropCorner") as UICorner;
        if (backdropCorner) {
            TweenService.Create(backdropCorner, tweenInfo, {
                CornerRadius: new UDim(1, 0),
            }).Play();
        }

        const tween = TweenService.Create(backdrop!, tweenInfo, {
            Size: new UDim2(0, 0, 0, 0),
        });
        tween.Play();
        TweenService.Create(backdrop!, tweenInfo, { BackgroundTransparency: 1, ImageTransparency: 1 }).Play();
        TweenService.Create(label!, tweenInfo, { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();
        TweenService.Create(longHand!, tweenInfo, { ImageTransparency: 1 }).Play();
        TweenService.Create(shortHand!, tweenInfo, { ImageTransparency: 1 }).Play();

        const connection = tween.Completed.Once((state) => {
            if (state !== Enum.PlaybackState.Completed) {
                connection.Disconnect();
                return;
            }

            if (guiContainer) {
                guiContainer.Enabled = false;
            }

            // Stop clock update loop
            if (clockUpdater) {
                clockUpdater = undefined;
            }
        });
    }

    export function destroy() {
        guiContainer?.Destroy();
        backdrop = undefined;
        label = undefined;
        clockFrame = undefined;
        longHand = undefined;
        shortHand = undefined;
        clockUpdater = undefined;
        pulseFrame = undefined;
        pulseTween = undefined;
        guiContainer = undefined;
    }
}

export default LoadingScreen;
