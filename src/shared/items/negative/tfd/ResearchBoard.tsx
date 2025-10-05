import Difficulty from "@rbxts/ejt";
import React from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { ITEM_PER_ID } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

function ResearchBoard({ items }: { items: Map<string, Item> }) {
    const difficulties = new Set<Difficulty>();
    for (const [, item] of items) {
        const difficulty = item.difficulty;
        if (difficulty.class === -99) continue;
        difficulties.add(difficulty);
    }

    const options = new Array<JSX.Element>();
    for (const difficulty of difficulties) {
        options.push(
            <imagelabel
                key={difficulty.id}
                BackgroundColor3={difficulty.color}
                BorderColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={2}
                Image={difficulty.image}
                Size={new UDim2(1, 0, 1, 0)}
                LayoutOrder={difficulty.layoutRating}
            >
                <uiaspectratioconstraint />
            </imagelabel>,
        );
    }

    return (
        <surfacegui
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

    .onClientLoad((model, item) => {
        const selectRoot = createRoot(model.WaitForChild("DifficultySelect"));
        selectRoot.render(<ResearchBoard items={ITEM_PER_ID} />);

        model.Destroying.Once(() => {
            selectRoot.unmount();
        });
    });
