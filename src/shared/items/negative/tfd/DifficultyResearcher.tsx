import Difficulty from "@rbxts/ejt";
import { packet, property } from "@rbxts/fletchette";
import React, { Fragment, useEffect, useMemo, useState } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { StarterGui, TweenService } from "@rbxts/services";
import { ITEM_PER_ID, Server } from "shared/api/APIExpose";
import { playSound } from "shared/asset/GameAssets";
import { RobotoMonoBold } from "shared/asset/GameFonts";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

const difficultyPacket = property<string | undefined>();
const setDifficultyPacket = packet<(difficultyId: string) => boolean>();

function DifficultyResearcherGui({
    selectPart,
    descriptionPart,
    imagePart,
    namePart,
    items,
}: {
    selectPart: BasePart;
    descriptionPart: BasePart;
    imagePart: BasePart;
    namePart: BasePart;
    items: Map<string, Item>;
}) {
    const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | undefined>(undefined);
    const difficulties = new Set<Difficulty>();
    for (const [, item] of items) {
        const difficulty = item.difficulty;
        if (difficulty.class === -99 || difficulty === Difficulty.Bonuses || difficulty === Difficulty.Excavation)
            continue;
        difficulties.add(difficulty);
    }

    const options = new Array<JSX.Element>();
    for (const difficulty of difficulties) {
        options.push(
            <imagebutton
                key={difficulty.id}
                Active={true}
                AutoButtonColor={false}
                BackgroundColor3={difficulty.color}
                BorderColor3={difficulty.color?.Lerp(Color3.fromRGB(0, 0, 0), 0.8)}
                BorderSizePixel={2}
                Image={difficulty.image}
                Size={new UDim2(1, 0, 1, 0)}
                LayoutOrder={difficulty.layoutRating}
                Event={{
                    Activated: () => {
                        const success = setDifficultyPacket.toServer(difficulty.id);
                        if (success) {
                            playSound("Click.mp3", selectPart);
                        } else {
                            playSound("Error.mp3", selectPart);
                        }
                    },
                    MouseEnter: (rbx) => {
                        TweenService.Create(rbx, new TweenInfo(0.1), {
                            ImageTransparency: 0.5,
                        }).Play();
                    },
                    MouseLeave: (rbx) => {
                        TweenService.Create(rbx, new TweenInfo(0.1), {
                            ImageTransparency: 0,
                        }).Play();
                    },
                }}
            >
                <uiaspectratioconstraint />
            </imagebutton>,
        );
    }

    useEffect(() => {
        const connection = difficultyPacket.observe((id) => {
            setCurrentDifficulty(id !== undefined ? Difficulty.get(id) : undefined);
        });
        return () => connection.Disconnect();
    }, []);

    const portal = useMemo(() => {
        return createPortal(<decal Texture={currentDifficulty?.image} />, imagePart);
    }, [currentDifficulty, imagePart]);

    const description = useMemo(() => {
        if (currentDifficulty === undefined) return "";
        let desc = currentDifficulty.description;
        if (desc === undefined) return "";
        [desc] = desc.gsub(`\\"`, '"'); // Escape quotes
        return desc;
    }, [currentDifficulty]);

    return (
        <Fragment>
            <surfacegui
                Adornee={selectPart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <scrollingframe
                    Active={true}
                    AutomaticCanvasSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 1, 0)}
                    HorizontalScrollBarInset={Enum.ScrollBarInset.ScrollBar}
                    ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
                    ScrollingDirection={Enum.ScrollingDirection.X}
                    Size={new UDim2(1, 0, 1, 0)}
                >
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        Padding={new UDim(0, 16)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />
                    <uipadding
                        PaddingBottom={new UDim(0, 16)}
                        PaddingLeft={new UDim(0, 16)}
                        PaddingRight={new UDim(0, 16)}
                        PaddingTop={new UDim(0, 16)}
                    />
                    {options}
                </scrollingframe>
            </surfacegui>
            <surfacegui
                Adornee={descriptionPart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <textlabel
                    BackgroundTransparency={1}
                    Font={Enum.Font.RobotoMono}
                    RichText={true}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={description}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={36}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                >
                    <uistroke Thickness={3} />
                    <uitextsizeconstraint MaxTextSize={36} />
                </textlabel>
                <uipadding
                    PaddingBottom={new UDim(0, 16)}
                    PaddingLeft={new UDim(0, 16)}
                    PaddingRight={new UDim(0, 16)}
                    PaddingTop={new UDim(0, 16)}
                />
            </surfacegui>
            <surfacegui
                Adornee={namePart}
                ClipsDescendants={true}
                LightInfluence={1}
                MaxDistance={1000}
                SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text={currentDifficulty?.name ?? ""}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Thickness={3} />
                </textlabel>
                <uipadding
                    PaddingBottom={new UDim(0, 24)}
                    PaddingLeft={new UDim(0, 16)}
                    PaddingRight={new UDim(0, 16)}
                    PaddingTop={new UDim(0, 24)}
                />
            </surfacegui>
            {portal}
        </Fragment>
    );
}

export = new Item(script.Name)
    .setName("Difficulty Researcher")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setDescription("Learn about the world.")
    .setPrice(new CurrencyBundle().set("Funds", 100), 1)
    .placeableEverywhere()
    .soldAt(ClassLowerNegativeShop)
    .persists()
    .unbreakable()

    .onInit(() => {
        setDifficultyPacket.fromClient((player, difficultyId) => {
            if (!Server.Permissions.checkPermLevel(player, "build")) return false;
            const difficulty = Difficulty.get(difficultyId);
            if (difficulty === undefined) return false;
            difficultyPacket.set(difficulty.id);
            return true;
        });
    })
    .onClientLoad((model, item, player) => {
        const folder = new Instance("Folder");
        folder.Name = `ResearchBoard-${model.Name}`;
        folder.Parent = player?.FindFirstChild("PlayerGui") ?? StarterGui;
        const root = createRoot(folder);

        const selectPart = model.WaitForChild("DifficultySelect") as BasePart;
        const descriptionPart = model.WaitForChild("DifficultyDescription") as BasePart;
        const imagePart = model.WaitForChild("DifficultyImage") as BasePart;
        const namePart = model.WaitForChild("DifficultyName") as BasePart;
        root.render(
            <DifficultyResearcherGui
                selectPart={selectPart}
                descriptionPart={descriptionPart}
                imagePart={imagePart}
                namePart={namePart}
                items={ITEM_PER_ID}
            />,
        );

        const connection = difficultyPacket.observe((id) => {
            const difficulty = id !== undefined ? Difficulty.get(id) : undefined;
            if (difficulty === undefined) return;
            const color = difficulty.color;
            if (color === undefined) return;

            selectPart.Color = color.Lerp(Color3.fromRGB(0, 0, 0), 0.5);
            descriptionPart.Color = color.Lerp(Color3.fromRGB(0, 0, 0), 0.8);
            imagePart.Color = color;
            namePart.Color = color.Lerp(Color3.fromRGB(0, 0, 0), 0.5);
        });

        model.Destroying.Once(() => {
            root.unmount();
            folder.Destroy();
            connection.Disconnect();
        });
    });
