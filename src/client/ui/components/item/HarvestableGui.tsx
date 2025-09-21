import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import { Debris, TweenService } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import ProgressBar from "client/ui/components/window/ProgressBar";
import { RobotoSlabExtraBold } from "client/ui/GameFonts";
import { emitEffect, playSound } from "shared/asset/GameAssets";
import Items from "shared/items/Items";
import { AREAS } from "shared/world/Area";
import HARVESTABLES from "shared/world/harvestable/Harvestable";

export default function HarvestableGui({ enabled, model }: { enabled: boolean; model: PVInstance }) {
    const harvestable = HARVESTABLES[model.Name as HarvestableId] as HarvestableData | undefined;
    if (harvestable === undefined) return <Fragment />;

    const [health, setHealth] = useState(harvestable.health);
    const maxHealth = harvestable.health;

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

            const currentTool = LOCAL_PLAYER.Character?.FindFirstChildOfClass("Tool");
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
                const color = multi > 1 ? Color3.fromRGB(217, 0, (multi - 1) * 120) : Color3.fromRGB(217, 0, 0);
                const gui = new Instance("BillboardGui");
                gui.Size = new UDim2(1, 0, 0.25, 0);
                gui.StudsOffset = new Vector3(0, 2, 0);
                gui.AlwaysOnTop = true;
                gui.Active = true;
                gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
                gui.Name = "HarvestableGui";
                const valueLabel = new Instance("TextLabel");
                valueLabel.BackgroundTransparency = 1;
                valueLabel.FontFace = RobotoSlabExtraBold;
                valueLabel.Text = `-${math.floor(-drop)}`;
                valueLabel.TextScaled = true;
                valueLabel.TextSize = 14;
                valueLabel.TextWrapped = true;
                valueLabel.Size = new UDim2(1, 0, 0.125 * (math.max(multi, 1) / 2 + 0.5), 0);
                valueLabel.TextColor3 = color;

                const stroke = new Instance("UIStroke");
                stroke.Thickness = 4;
                stroke.Color = Color3.fromRGB(0, 0, 0);
                stroke.Parent = valueLabel;
                gui.Adornee = model;
                gui.Parent = model;
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
            Size={new UDim2(4, 0, 2, 0)}
            StudsOffset={new Vector3(0, 2.5, 0)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabExtraBold}
                Size={new UDim2(1, 0, 0.5, 0)}
                Text={item?.name ?? harvestable?.name ?? model.Name}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={4} />
            </textlabel>

            <ProgressBar
                current={health}
                max={maxHealth}
                colorSequence={new ColorSequence(Color3.fromRGB(0, 255, 0), Color3.fromRGB(0, 166, 56))}
                frameProps={{
                    Size: new UDim2(1, 0, 0.3, 0),
                }}
            />

            <uilistlayout Padding={new UDim(0.05, 0)} SortOrder={Enum.SortOrder.LayoutOrder} />
        </billboardgui>
    );
}

export function HarvestableGuiRenderer() {
    const [enabled, setEnabled] = useState(false);

    const harvestableModels = useMemo(() => {
        const models = new Array<Instance>();
        for (const [, area] of pairs(AREAS)) {
            const folder = area.worldNode.getInstance()?.FindFirstChild("Harvestable");
            if (folder === undefined) continue;
            for (const child of folder.GetChildren()) {
                if (child.IsA("PVInstance") && HARVESTABLES[child.Name as HarvestableId] !== undefined) {
                    models.push(child);
                }
            }
        }
        return models;
    }, []);

    useEffect(() => {
        const onCharacterAdded = (character: Model) => {
            character.ChildAdded.Connect((child) => {
                if (child.IsA("Tool")) {
                    setEnabled(true);
                }
            });
            character.ChildRemoved.Connect((child) => {
                if (child.IsA("Tool")) {
                    setEnabled(false);
                }
            });
        };
        const connection = LOCAL_PLAYER.CharacterAdded.Connect(onCharacterAdded);
        if (LOCAL_PLAYER.Character !== undefined) {
            onCharacterAdded(LOCAL_PLAYER.Character);
        }

        return () => {
            connection.Disconnect();
        };
    }, []);

    return (
        <Fragment>
            {harvestableModels?.map((model) => (
                <HarvestableGui enabled={enabled} model={model as PVInstance} />
            ))}
        </Fragment>
    );
}
