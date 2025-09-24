import { BaseOnoeNum } from "@antivivi/serikanum";
import { Debris, StarterGui, TextService, TweenService, Workspace } from "@rbxts/services";
import { PLAYER_GUI } from "client/constants";
import Shaker from "client/ui/components/effect/Shaker";
import MusicManager from "client/ui/MusicManager";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import { IS_EDIT } from "shared/Context";
import { AREAS } from "shared/world/Area";

declare global {
    interface Assets {
        Resets: Folder;
    }
}

function createDramaticIntro(): ScreenGui {
    // Create the black screen overlay
    const screenGui = new Instance("ScreenGui");
    screenGui.Name = "ResetDramaticIntro";
    screenGui.DisplayOrder = 1000; // High display order to ensure it's on top
    screenGui.IgnoreGuiInset = true;
    screenGui.ResetOnSpawn = false;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Parent = IS_EDIT ? StarterGui : PLAYER_GUI;

    // Black background frame
    const blackFrame = new Instance("Frame");
    blackFrame.Name = "BlackOverlay";
    blackFrame.Size = new UDim2(1, 0, 1, 0);
    blackFrame.Position = new UDim2(0, 0, 0, 0);
    blackFrame.BackgroundColor3 = new Color3(0, 0, 0);
    blackFrame.BackgroundTransparency = 0;
    blackFrame.BorderSizePixel = 0;
    blackFrame.ZIndex = 1;
    blackFrame.Parent = screenGui;

    // Dramatic text label - start with empty text
    const textLabel = new Instance("TextLabel");
    textLabel.Name = "DramaticText";
    textLabel.AnchorPoint = new Vector2(0.5, 0.5);
    textLabel.Position = new UDim2(0.5, 0, 0.5, 0);
    textLabel.BackgroundTransparency = 1;
    textLabel.Font = Enum.Font.Merriweather;
    textLabel.Text = ""; // Start with empty text for character-by-character animation
    textLabel.TextColor3 = new Color3(1, 1, 1);
    textLabel.TextSize = 30;
    textLabel.TextWrapped = true;
    textLabel.TextXAlignment = Enum.TextXAlignment.Left;
    textLabel.TextYAlignment = Enum.TextYAlignment.Center;
    textLabel.ZIndex = 2;
    textLabel.TextTransparency = 0; // Make visible since we'll control character appearance
    textLabel.Parent = screenGui;

    // Text stroke for better visibility
    const textStroke = new Instance("UIStroke");
    textStroke.Color = new Color3(0, 0, 0);
    textStroke.Thickness = 4;
    textStroke.Transparency = 0; // Make stroke visible
    textStroke.Parent = textLabel;

    return screenGui;
}

async function animateTextCharacterByCharacter(textLabel: TextLabel, fullText: string): Promise<void> {
    const charDelay = 0.06;
    const fadeInDuration = 0.3; // Duration for each character to fade in
    const characterLabels: TextLabel[] = [];

    // Set up the container size
    const textSize = TextService.GetTextSize(fullText, 30, textLabel.Font, new Vector2(1000, 1000));
    textLabel.Size = new UDim2(0, textSize.X, 0, 30);
    textLabel.Text = ""; // Keep main label empty

    // Create individual character labels
    for (let i = 0; i < fullText.size(); i++) {
        const char = fullText.sub(i + 1, i + 1);
        const charLabel = new Instance("TextLabel");
        charLabel.Name = `Char${i}`;
        charLabel.BackgroundTransparency = 1;
        charLabel.Font = textLabel.Font;
        charLabel.Text = char;
        charLabel.TextColor3 = textLabel.TextColor3;
        charLabel.TextSize = textLabel.TextSize;
        charLabel.TextXAlignment = Enum.TextXAlignment.Left;
        charLabel.TextYAlignment = Enum.TextYAlignment.Center;
        charLabel.TextTransparency = 1; // Start invisible
        charLabel.ZIndex = textLabel.ZIndex;

        // Calculate position for this character
        const precedingText = fullText.sub(1, i);
        const precedingSize = TextService.GetTextSize(precedingText, 30, textLabel.Font, new Vector2(1000, 1000));
        const charSize = TextService.GetTextSize(char, 30, textLabel.Font, new Vector2(1000, 1000));

        charLabel.Size = new UDim2(0, charSize.X, 1, 0);
        charLabel.Position = new UDim2(0, precedingSize.X, 0, 0);
        charLabel.Parent = textLabel;

        characterLabels.push(charLabel);
    }

    // Animate characters one by one
    for (let currentIndex = 0; currentIndex < fullText.size(); currentIndex++) {
        const charLabel = characterLabels[currentIndex];
        const currentChar = fullText.sub(currentIndex + 1, currentIndex + 1);

        // Fade in the character
        const fadeIn = TweenService.Create(
            charLabel,
            new TweenInfo(fadeInDuration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
            { TextTransparency: 0 },
        );

        fadeIn.Play();

        if (currentIndex < fullText.size() - 1) {
            // Add extra delay for punctuation marks
            let nextDelay = charDelay;

            // Check for ellipses (three dots in a row)
            const isEllipsis =
                currentChar === "." &&
                currentIndex >= 2 &&
                fullText.sub(currentIndex - 1, currentIndex - 1) === "." &&
                fullText.sub(currentIndex, currentIndex) === ".";

            if (isEllipsis) {
                // For the third dot in "...", add 1.5 seconds total delay
                nextDelay = 1.5;
            } else if (currentChar === "." || currentChar === "!" || currentChar === "?") {
                nextDelay = 1;
            } else if (currentChar === "," || currentChar === ";") {
                nextDelay = 0.5;
            }

            await new Promise<void>((resolve) => {
                task.delay(nextDelay, () => resolve());
            });
        } else {
            // Wait for the last character to finish fading in
            await new Promise<void>((resolve) => {
                task.delay(fadeInDuration, () => resolve());
            });
        }
    }
}

async function fadeOutTextElements(textLabel: TextLabel, textStroke: UIStroke): Promise<void> {
    // Fade out all individual character labels
    const characterLabels = textLabel.GetChildren();
    for (const charLabel of characterLabels) {
        if (charLabel.IsA("TextLabel")) {
            const charFadeOut = TweenService.Create(
                charLabel,
                new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                { TextTransparency: 1 },
            );
            charFadeOut.Play();
        }
    }

    // Also fade out the stroke
    const strokeFadeOut = TweenService.Create(
        textStroke,
        new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
        { Transparency: 1 },
    );
    strokeFadeOut.Play();

    // Wait for fade out to complete
    await new Promise<void>((resolve) => {
        task.delay(1, () => resolve());
    });
}

async function fadeOutBlackScreenAndStartCameraSequence(
    dramaticIntro: ScreenGui,
    currentCamera: Camera,
): Promise<void> {
    const blackFrame = dramaticIntro.FindFirstChild("BlackOverlay") as Frame;
    const blackFadeOut = TweenService.Create(
        blackFrame,
        new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
        { BackgroundTransparency: 1 },
    );
    blackFadeOut.Play();

    // Start the original camera sequence
    currentCamera.CameraType = Enum.CameraType.Scriptable;
    const instance = AREAS.BarrenIslands.worldNode.waitForInstance().WaitForChild("ResetCamera");
    const toCframe = (instance as BasePart).CFrame;
    TweenService.Create(currentCamera, new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
        CFrame: toCframe,
    }).Play();

    // Clean up the dramatic intro GUI after 1 second
    await new Promise<void>((resolve) => {
        task.delay(1, () => {
            dramaticIntro.Destroy();
            resolve();
        });
    });
}

async function playThunderSequence(currentCamera: Camera): Promise<void> {
    playSound("Thunder.mp3");
    const lightning = ASSETS.Resets.WaitForChild("SkillificationLightning").Clone() as BasePart;
    lightning.Parent = Workspace;
    TweenService.Create(lightning, new TweenInfo(1), { Transparency: 1 }).Play();

    await new Promise<void>((resolve) => {
        task.delay(0.35, () => {
            const effects = lightning.GetChildren();
            for (const effect of effects) {
                if (effect.IsA("ParticleEmitter")) effect.Enabled = false;
            }
            currentCamera.CameraType = Enum.CameraType.Custom;
            Shaker.shake();

            // Fade music back in
            if (MusicManager.playing !== undefined) {
                MusicManager.fadeIn(MusicManager.playing);
            }
            resolve();
        });
    });

    Debris.AddItem(lightning, 2);
}

export default async function playSkillificationSequence(amount: BaseOnoeNum) {
    const currentCamera = Workspace.CurrentCamera;
    if (currentCamera === undefined) return;
    if (currentCamera.CameraType === Enum.CameraType.Scriptable) return;

    // Create the dramatic intro overlay
    const dramaticIntro = createDramaticIntro();
    const textLabel = dramaticIntro.FindFirstChild("DramaticText") as TextLabel;
    const textStroke = textLabel.FindFirstChild("UIStroke") as UIStroke;

    // Start the dramatic sequence
    playSound("MagicCast.mp3");
    playSound("resets/Skillification.mp3");
    if (MusicManager.playing !== undefined) {
        MusicManager.fadeOut(MusicManager.playing);
    }

    // Wait initial delay
    await new Promise<void>((resolve) => {
        task.delay(0.5, () => resolve());
    });

    // Phase 1: Animate text character by character
    const dramaticText = "You sacrificed everything for power... Now, embrace it.";
    await animateTextCharacterByCharacter(textLabel, dramaticText);

    // Phase 2: Hold the text for dramatic effect (2 seconds)
    await new Promise<void>((resolve) => {
        task.delay(2, () => resolve());
    });

    // Phase 3: Fade out the text (1 second)
    await fadeOutTextElements(textLabel, textStroke);

    // Phase 4: Fade out the black screen and start original sequence (1 second)
    await fadeOutBlackScreenAndStartCameraSequence(dramaticIntro, currentCamera);

    // Thunder and lightning sequence (1 second delay + sequence)
    await new Promise<void>((resolve) => {
        task.delay(1, () => resolve());
    });

    await playThunderSequence(currentCamera);
}
