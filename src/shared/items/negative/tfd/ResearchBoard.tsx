import Difficulty from "@rbxts/ejt";
import { packet, request, signal } from "@rbxts/fletchette";
import React, { Fragment } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { StarterGui, TweenService } from "@rbxts/services";
import { ITEM_PER_ID } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import { perItemProperty } from "shared/item/utils/perItemPacket";

const difficultyPacket = perItemProperty(
    signal<(placementId: string, difficultyId: string) => void>(),
    request<(placementId: string) => string>(),
);
const setDifficultyPacket = packet<(placementId: string, difficultyId: string) => void>();

function ResearchBoard({
    adornee,
    placementId,
    items,
}: {
    adornee: BasePart;
    placementId: string;
    items: Map<string, Item>;
}) {
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
                BorderColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={2}
                Image={difficulty.image}
                Size={new UDim2(1, 0, 1, 0)}
                LayoutOrder={difficulty.layoutRating}
                Event={{
                    Activated: () => {
                        setDifficultyPacket.toServer(placementId, difficulty.id);
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

    return (
        <surfacegui
            Adornee={adornee}
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
    );
}

export = new Item(script.Name)
    .setName("Research Board")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setDescription("Learn about the world.")
    .setPrice(new CurrencyBundle().set("Funds", 100), 1)
    .placeableEverywhere()
    .persists()

    .onClientLoad((model, item, player) => {
        const folder = new Instance("Folder");
        folder.Name = `ResearchBoard-${model.Name}`;
        folder.Parent = player?.FindFirstChild("PlayerGui") ?? StarterGui;
        const root = createRoot(folder);

        const selectPart = model.WaitForChild("DifficultySelect") as BasePart;
        root.render(
            <Fragment>
                <ResearchBoard adornee={selectPart} placementId={model.Name} items={ITEM_PER_ID} />
            </Fragment>,
        );

        difficultyPacket.observe(model, (difficultyId) => {});

        model.Destroying.Once(() => {
            root.unmount();
            folder.Destroy();
        });
    });
