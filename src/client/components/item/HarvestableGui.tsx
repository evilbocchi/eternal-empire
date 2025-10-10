import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import { Debris, TweenService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import { emitEffect, playSound } from "shared/asset/GameAssets";
import { RobotoSlabExtraBold, RobotoSlabHeavy } from "shared/asset/GameFonts";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Items from "shared/items/Items";
import HARVESTABLES from "shared/world/harvestable/Harvestable";

export default function HarvestableGui({ enabled, model }: { enabled: boolean; model: PVInstance }) {
    const harvestable = HARVESTABLES[model.Name as HarvestableId] as HarvestableData | undefined;
    if (harvestable === undefined) return <Fragment />;

    const [health, setHealth] = useState(harvestable.health);
    const maxHealth = harvestable.health;

    const colorSequence = useMemo(() => {
        const healthPercent = health / maxHealth;

        // Create a dynamic gradient based on health percentage
        if (healthPercent > 0.5) {
            return new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(46, 204, 113)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(46, 204, 84)),
            ]);
        } else if (healthPercent > 0.25) {
            return new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(241, 196, 15)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(230, 126, 34)),
            ]);
        } else {
            return new ColorSequence([
                new ColorSequenceKeypoint(0, Color3.fromRGB(230, 126, 34)),
                new ColorSequenceKeypoint(1, Color3.fromRGB(231, 76, 60)),
            ]);
        }
    }, [health, maxHealth]);

    const item = Items.getItem(model.Name);

    useEffect(() => {
        if (!model.IsA("PVInstance")) return;
        const harvestable = HARVESTABLES[model.Name as HarvestableId];
        if (harvestable === undefined) return;
        let isNew = true;
        let prevHealth = 0;
        const updateHealth = () => {
            const currentHealth = (model.GetAttribute("Health") as number) ?? harvestable.health;
            setHealth(currentHealth);
            const drop = currentHealth - prevHealth;
            prevHealth = currentHealth;

            if (isNew === true) {
                isNew = false;
                return;
            }

            const currentTool = getPlayerCharacter()?.FindFirstChildOfClass("Tool");
            if (currentTool === undefined) return;

            const highlight = new Instance("Highlight");
            TweenService.Create(highlight, new TweenInfo(0.5), { FillTransparency: 1, OutlineTransparency: 1 }).Play();
            highlight.Adornee = model;

            const blade = currentTool.FindFirstChild("Blade") as BasePart | undefined;
            const effect = emitEffect("ToolUse", blade ?? model);
            effect.Color = new ColorSequence(blade?.Color ?? new Color3(255, 0, 0));

            if (drop < 0) {
                const item = Items.getItem(currentTool.Name);
                if (item === undefined) return;

                const gear = item.findTrait("Gear");
                if (gear === undefined) return;

                const multi = -drop / gear.damage!;
                effect.Brightness = multi;

                const baseColor = Color3.fromRGB(217, 0, 0);
                const critColor = Color3.fromRGB(158, 0, 217);
                const colorBlend = math.clamp((multi - 1) / 3, 0, 1);
                const damageColor = baseColor.Lerp(critColor, colorBlend);

                const damageGui = new Instance("BillboardGui");
                const horizontalJitter = math.random(-25, 25) / 75;
                const startingOffset = new Vector3(horizontalJitter, 0, horizontalJitter);
                damageGui.Size = new UDim2(5, 0, 1, 0);
                damageGui.StudsOffsetWorldSpace = startingOffset;
                damageGui.AlwaysOnTop = true;
                damageGui.Active = true;
                damageGui.MaxDistance = 60;
                damageGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
                damageGui.Name = "HarvestableDamageLabel";

                const valueLabel = new Instance("TextLabel");
                valueLabel.AnchorPoint = new Vector2(0.5, 0.5);
                valueLabel.Position = new UDim2(0.5, 0, 0.5, 0);
                valueLabel.BackgroundTransparency = 1;
                valueLabel.FontFace = RobotoSlabExtraBold;
                valueLabel.Text = `-${math.floor(-drop * 10) / 10}`;
                valueLabel.TextScaled = true;
                valueLabel.TextSize = 14;
                valueLabel.TextWrapped = true;
                valueLabel.TextColor3 = damageColor;
                valueLabel.TextTransparency = 0;
                valueLabel.Size = new UDim2(1, 0, 0.125 * (math.max(multi, 1) / 2) + 0.7, 0);

                const stroke = new Instance("UIStroke");
                stroke.Thickness = 4;
                stroke.Color = Color3.fromRGB(0, 0, 0);
                stroke.Transparency = 0;
                stroke.Parent = valueLabel;

                valueLabel.Parent = damageGui;
                damageGui.Adornee = model;
                damageGui.Parent = model;

                const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Cubic, Enum.EasingDirection.In);
                TweenService.Create(damageGui, tweenInfo, {
                    StudsOffsetWorldSpace: new Vector3(0, -1.75, 0),
                }).Play();
                TweenService.Create(valueLabel, tweenInfo, {
                    TextTransparency: 1,
                    Rotation: 15 * (math.random() - 0.5),
                }).Play();
                TweenService.Create(stroke, tweenInfo, {
                    Transparency: 1,
                }).Play();

                Debris.AddItem(damageGui, 4);

                if (multi > 1.5) {
                    playSound("Critical.mp3");
                }
            }

            playSound("Harvest.mp3");

            highlight.Parent = model;
            Debris.AddItem(highlight, 2);
        };
        updateHealth();
        const connection = model.GetAttributeChangedSignal("Health").Connect(updateHealth);

        return () => {
            connection.Disconnect();
        };
    }, []);

    const accent = useMemo(() => {
        if (model.IsA("BasePart")) {
            return model.Color;
        }

        const colors = new Array<Color3>();

        for (const part of model.GetChildren()) {
            if (part.IsA("BasePart")) {
                colors.push(part.Color);
            }
        }
        if (colors.isEmpty()) return Color3.fromRGB(255, 255, 255);
        let r = 0;
        let g = 0;
        let b = 0;
        for (const color of colors) {
            r += color.R;
            g += color.G;
            b += color.B;
        }
        const size = colors.size();
        return new Color3(r / size, g / size, b / size);
    }, [model]);

    const changeTweenInfo = new TweenInfo(0.2, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

    const healthText = `${math.floor(health * 10) / 10}/${maxHealth}`;

    return (
        <billboardgui
            Adornee={model}
            Active={true}
            AlwaysOnTop={true}
            Enabled={enabled}
            MaxDistance={25}
            Size={new UDim2(6, 0, 2, 0)}
            StudsOffset={new Vector3(0, 2.5, 0)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            {/* Main window */}
            <imagelabel
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BackgroundTransparency={0}
                BorderSizePixel={0}
                Image={getAsset("assets/HarvestableFrame.png")}
                Position={new UDim2(0.5, 0, 0.3, 0)}
                Size={new UDim2(1.1, 0, 0.6, 0)}
                ZIndex={-5}
            >
                <uigradient
                    Color={
                        new ColorSequence(
                            accent.Lerp(Color3.fromRGB(0, 0, 0), 0.2),
                            accent.Lerp(Color3.fromRGB(0, 0, 0), 0.4),
                        )
                    }
                    Rotation={90}
                />
                <uipadding
                    PaddingTop={new UDim(0.05, 0)}
                    PaddingBottom={new UDim(0.05, 0)}
                    PaddingLeft={new UDim(0.035, 0)}
                    PaddingRight={new UDim(0.035, 0)}
                />
            </imagelabel>

            {/* Title text container */}
            <textlabel
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Text={item?.name ?? harvestable?.name ?? model.Name}
                TextColor3={accent.Lerp(Color3.fromRGB(255, 255, 255), 0.75)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Center}
                ZIndex={2}
                Position={new UDim2(0.5, 0, 0, 0)}
                Size={new UDim2(2, 0, 0.5, 0)}
            >
                <uistroke StrokeSizingMode={Enum.StrokeSizingMode.ScaledSize} Thickness={0.07} Color={accent}>
                    <uigradient Color={new ColorSequence(Color3.fromRGB(64, 64, 64))} />
                </uistroke>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(201, 201, 201)),
                        ])
                    }
                    Rotation={90}
                />
            </textlabel>

            {/* Health bar container  */}
            <frame
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.55, 0)}
                Size={new UDim2(1, 0, 0.4, 0)}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(38, 38, 38)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(23, 23, 23)),
                        ])
                    }
                    Rotation={90}
                />
                <uistroke
                    StrokeSizingMode={Enum.StrokeSizingMode.ScaledSize}
                    Thickness={0.07}
                    Color={Color3.fromRGB(28, 28, 28)}
                />
                {/* Health text main */}
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabExtraBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.9, 0, 0.95, 0)}
                    Text={healthText}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    ZIndex={2}
                >
                    <uistroke
                        StrokeSizingMode={Enum.StrokeSizingMode.ScaledSize}
                        Thickness={0.07}
                        Color={Color3.fromRGB(82, 82, 82)}
                    >
                        <uigradient Color={colorSequence} />
                    </uistroke>
                </textlabel>

                <frame
                    ref={(rbx) => {
                        if (rbx === undefined) return;
                        TweenService.Create(rbx, changeTweenInfo, {
                            Size: new UDim2(math.clamp(health / maxHealth, 0, 1), 0, 1, 0),
                        }).Play();
                    }}
                    BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                    BorderSizePixel={0}
                    ZIndex={0}
                >
                    <uigradient Color={colorSequence} Rotation={90} />
                </frame>
            </frame>
        </billboardgui>
    );
}
