import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import { Debris, TweenService } from "@rbxts/services";
import { emitEffect, playSound } from "shared/asset/GameAssets";
import { RobotoMonoBold, RobotoSlabExtraBold } from "shared/asset/GameFonts";
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
                const startingOffset = new Vector3(horizontalJitter, 2.75, horizontalJitter);
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
                valueLabel.Text = `-${math.floor(-drop)}`;
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

    return (
        <billboardgui
            Adornee={model}
            Active={true}
            AlwaysOnTop={true}
            Enabled={enabled}
            MaxDistance={25}
            Size={new UDim2(5, 0, 2, 0)}
            StudsOffset={new Vector3(0, 2.5, 0)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            {/* Window shadow */}
            <frame
                BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                BackgroundTransparency={0.3}
                BorderSizePixel={0}
                Position={new UDim2(0.02, 0, 0.02, 0)}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={0}
            />

            {/* Main window */}
            <frame
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BackgroundTransparency={0}
                BorderSizePixel={0}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={1}
            >
                <uigradient
                    Color={new ColorSequence(Color3.fromRGB(39, 39, 39), Color3.fromRGB(0, 0, 0))}
                    Rotation={90}
                />
                <uipadding
                    PaddingTop={new UDim(0.05, 0)}
                    PaddingBottom={new UDim(0.05, 0)}
                    PaddingLeft={new UDim(0.035, 0)}
                    PaddingRight={new UDim(0.035, 0)}
                />
                <uilistlayout Padding={new UDim(0.05, 0)} FillDirection={Enum.FillDirection.Vertical} />

                {/* Title text container */}
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.55, 0)}>
                    {/* Title main */}
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoMonoBold}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text={item?.name ?? harvestable?.name ?? model.Name}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        ZIndex={2}
                    />
                </frame>

                {/* Health bar container  */}
                <frame
                    BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0.35, 0)}
                >
                    <uigradient
                        Color={new ColorSequence(Color3.fromRGB(255, 255, 255), Color3.fromRGB(200, 200, 200))}
                        Rotation={90}
                    />
                    <frame
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundColor3={Color3.fromRGB(39, 39, 39)}
                        BorderSizePixel={0}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(0.98, 0, 0.86, 0)}
                    >
                        {/* Health text shadows (4 corners to simulate stroke) */}
                        {[
                            { x: 0.507, y: 0.52 }, // Bottom-right (scaled for aspect ratio)
                            { x: 0.493, y: 0.52 }, // Bottom-left
                            { x: 0.507, y: 0.48 }, // Top-right
                            { x: 0.493, y: 0.48 }, // Top-left
                        ].map((offset, index) => (
                            <textlabel
                                key={index}
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                BackgroundTransparency={1}
                                FontFace={RobotoMonoBold}
                                Position={new UDim2(offset.x, 0, offset.y, 0)}
                                Size={new UDim2(0.8, 0, 0.9, 0)}
                                Text={`${health}/${maxHealth}`}
                                TextColor3={Color3.fromRGB(0, 0, 0)}
                                TextScaled={true}
                                TextTransparency={0}
                                ZIndex={1}
                            />
                        ))}
                        {/* Health text main */}
                        <textlabel
                            AnchorPoint={new Vector2(0.5, 0.5)}
                            BackgroundTransparency={1}
                            FontFace={RobotoMonoBold}
                            Position={new UDim2(0.5, 0, 0.5, 0)}
                            Size={new UDim2(0.8, 0, 0.9, 0)}
                            Text={`${health}/${maxHealth}`}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            ZIndex={2}
                        />

                        <frame
                            BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                            BorderSizePixel={0}
                            Size={new UDim2(math.clamp(health / maxHealth, 0, 1), 0, 1, 0)}
                            Visible={health > 0}
                            ZIndex={0}
                        >
                            <uigradient Color={colorSequence} Rotation={90} />
                        </frame>
                    </frame>
                </frame>
            </frame>
        </billboardgui>
    );
}
