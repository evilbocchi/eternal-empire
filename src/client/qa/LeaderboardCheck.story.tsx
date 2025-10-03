import { OnoeNum } from "@antivivi/serikanum";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { DataStoreService } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            store: "Funds",
        },
    },
    (props) => {
        const parsed = DataStoreService.GetOrderedDataStore(props.controls.store).GetSortedAsync(false, 100);
        const page = parsed.GetCurrentPage();
        const content = new Array<{ position: number; player: string; score: string }>();
        for (let i = 0; i < page.size(); i++) {
            const entry = page[i];
            if (entry === undefined) continue;
            const value = OnoeNum.fromSingle(entry.value as number).toString();
            content.push({ position: i + 1, player: entry.key, score: value });
            print(`${i + 1}. ${entry.key} - ${value}`); // For debugging purposes
        }

        return (
            <scrollingframe
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundColor3={new Color3(1, 1, 1)}
                Size={UDim2.fromScale(1, 1)}
            >
                <uilistlayout Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder} />
                {content.map((entry) => (
                    <textlabel
                        Size={new UDim2(1, 0, 0, 50)}
                        BackgroundTransparency={1}
                        Text={`${entry.position}. ${entry.player} - ${entry.score}`}
                    />
                ))}
            </scrollingframe>
        );
    },
);
