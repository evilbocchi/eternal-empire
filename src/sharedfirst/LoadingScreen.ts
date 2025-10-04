import { Players, TweenService } from "@rbxts/services";

namespace LoadingScreen {
    let screenGui: ScreenGui | undefined;
    let label: TextLabel | undefined;
    let clockFrame: Frame | undefined;
    let longHand: ImageLabel | undefined;
    let shortHand: ImageLabel | undefined;
    let clockUpdater: thread | undefined;
    let pulseFrame: Frame | undefined;
    let pulseTween: Tween | undefined;

    function createGuiIfNeeded() {
        if (screenGui) return;

        const player = Players.LocalPlayer;
        if (!player) return;

        const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;

        screenGui = new Instance("ScreenGui") as ScreenGui;
        screenGui.Name = "LoadingScreen";
        screenGui.ResetOnSpawn = false;
        screenGui.IgnoreGuiInset = true;
        screenGui.DisplayOrder = 1000;
        screenGui.Parent = playerGui;

        const backdrop = new Instance("Frame") as Frame;
        backdrop.Name = "Backdrop";
        backdrop.Size = new UDim2(1, 0, 1, 0);
        backdrop.Position = new UDim2(0, 0, 0, 0);
        backdrop.BackgroundColor3 = new Color3(0, 0, 0);
        backdrop.BorderSizePixel = 0;
        backdrop.ZIndex = 1;
        backdrop.Parent = screenGui;

        // Clock Frame (center)
        clockFrame = new Instance("Frame") as Frame;
        clockFrame.Name = "Clock";
        clockFrame.AnchorPoint = new Vector2(0.5, 0.5);
        clockFrame.Position = new UDim2(0.5, 0, 0.5, 0);
        clockFrame.Size = new UDim2(0, 192, 0, 192);
        clockFrame.BackgroundTransparency = 1;
        clockFrame.ZIndex = 3;
        clockFrame.Parent = screenGui;

        // Pulse Frame (center, for glow effect)
        pulseFrame = new Instance("Frame") as Frame;
        pulseFrame.Name = "Pulse";
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
        shortHand = new Instance("ImageLabel") as ImageLabel;
        shortHand.Name = "ShortHand";
        shortHand.AnchorPoint = new Vector2(0.5, 0.5); // bottom center
        shortHand.Position = new UDim2(0.5, 0, 0.5, 0);
        shortHand.Size = new UDim2(0, 80, 0, 80);
        shortHand.BackgroundTransparency = 1;
        shortHand.Image = "rbxassetid://8966915998";
        shortHand.ScaleType = Enum.ScaleType.Fit;
        shortHand.ZIndex = 4;
        shortHand.Parent = clockFrame;

        // Long hand (minute)
        longHand = new Instance("ImageLabel") as ImageLabel;
        longHand.Name = "LongHand";
        longHand.AnchorPoint = new Vector2(0.5, 0.5); // bottom center
        longHand.Position = new UDim2(0.5, 0, 0.5, 0);
        longHand.Size = new UDim2(0, 96, 0, 96);
        longHand.BackgroundTransparency = 1;
        longHand.Image = "rbxassetid://8966886535";
        longHand.ScaleType = Enum.ScaleType.Fit;
        longHand.ZIndex = 5;
        longHand.Parent = clockFrame;

        // Loading text label (to the left of the clock)
        label = new Instance("TextLabel") as TextLabel;
        label.Name = "LoadingText";
        label.BackgroundTransparency = 1;
        // Anchor to bottom-right, but offset to the left of the clock
        label.AnchorPoint = new Vector2(1, 1);
        label.Position = new UDim2(1, -140, 1, -12); // 12px from edge, 128px left for clock+gap
        label.Size = new UDim2(0.5, 0, 0.06, 0);
        label.TextColor3 = new Color3(1, 1, 1);
        label.TextScaled = true;
        label.TextWrapped = true;
        label.TextXAlignment = Enum.TextXAlignment.Right;
        label.TextYAlignment = Enum.TextYAlignment.Bottom;
        label.Font = Enum.Font.SourceSans;
        label.ZIndex = 2;
        label.Parent = screenGui;

        screenGui.Enabled = false;
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

    export function showLoadingScreen(text: string) {
        createGuiIfNeeded();
        if (!screenGui || !label) return;
        label.Text = text ?? "";
        screenGui.Enabled = true;

        // Fade in all children
        if (screenGui) {
            const tweenInfo = new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

            for (const child of screenGui.GetDescendants()) {
                if (child.IsA("Frame") && child.Name === "Backdrop") {
                    child.BackgroundTransparency = 1;
                    TweenService.Create(child, tweenInfo, { BackgroundTransparency: 0 }).Play();
                }
                if (child.IsA("TextLabel")) {
                    child.TextTransparency = 1;
                    child.TextStrokeTransparency = 1;
                    TweenService.Create(child, tweenInfo, {
                        TextTransparency: 0,
                        TextStrokeTransparency: 0,
                    }).Play();
                }
                if (child.IsA("ImageLabel")) {
                    child.ImageTransparency = 1;
                    TweenService.Create(child, tweenInfo, { ImageTransparency: 0 }).Play();
                }
            }
        }

        // Start clock update loop
        if (!clockUpdater && clockFrame && longHand && shortHand) {
            clockUpdater = task.spawn(() => {
                while (screenGui && screenGui.Enabled) {
                    updateClock();
                    task.wait();
                }
                clockUpdater = undefined;
            });
        }
    }

    export function hideLoadingScreen() {
        if (!screenGui) return;

        // Fade out all children
        const tweenInfo = new TweenInfo(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.In);

        for (const child of screenGui.GetDescendants()) {
            if (child.IsA("Frame") && child.Name === "Backdrop") {
                TweenService.Create(child, tweenInfo, { BackgroundTransparency: 1 }).Play();
            }
            if (child.IsA("TextLabel")) {
                TweenService.Create(child, tweenInfo, {
                    TextTransparency: 1,
                    TextStrokeTransparency: 1,
                }).Play();
            }
            if (child.IsA("ImageLabel")) {
                TweenService.Create(child, tweenInfo, { ImageTransparency: 1 }).Play();
            }
        }
        // After fade out, disable
        task.delay(1, () => {
            if (screenGui) {
                screenGui.Enabled = false;
            }
        });
        // Stop clock updater
        clockUpdater = undefined;
    }
}

export default LoadingScreen;
