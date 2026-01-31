import React, { JSX } from "@rbxts/react";
import { RobotoMono, RobotoMonoBold, RobotoSlabHeavy } from "shared/asset/GameFonts";
import ChangelogPart from "shared/world/nodes/ChangelogPart";

class Changelog {
    readonly version: string;
    readonly entries: string[];

    constructor(version: string, entries: string[]) {
        this.version = version;
        this.entries = entries;
    }
}

const CHANGELOGS = [
    new Changelog("0.1 - Initial Release", ["Released game :)))"]),
    new Changelog("0.2 - Change of Scenery", [
        "Changed Place icon in Build Mode",
        "Implemented Basic Charger",
        "Stud",
        "Added some cool OSTs",
        "Added portal to next island",
        "Did some lighting changes",
    ]),
    new Changelog("0.3 - April Fools Update Without The Fools", [
        "Added difficulties True Ease to Reversed Peripherality",
        "Made Charger radius more accurate",
        "Made numerous balancing changes",
        "Fixed up UI",
        "Added commands to join private empires without having to be invited",
        "Made upgraders more fair, with addition going first and multiplication second",
        "Fixed some weird rounding issue",
        "Fixed currency receive gui sometimes appearing as a white canvas",
        "Added track Melodic Romance to Barren Islands",
    ]),
    new Changelog("0.4 - Reformation Update Pt. 1", [
        "Added difficulties Relax to Astronomical",
        "Added quests system",
        "Added 5 new quests",
        "Added level system with level point distribution",
        "Warp button actually does something now",
        "Re-balanced most items above True Ease",
        "Released second area",
    ]),
    new Changelog("0.5 - Reformation Update Pt. 2", [
        "Added difficulties Win to Do Nothing",
        "Revamped UI massively",
        "Reworked quests, adding 4 new ones",
        "Expanded Barren Islands",
        "Added crafting and materials system",
    ]),
    new Changelog("0.6 - Wall of Text", [
        "Added difficulties and items Blessing to Frivolous",
        "Added more crafting items",
        "Added 2 new quests, Learning The Past and Ludicrous Escape",
        "Revamped Crafting Introductions",
        "Leaderboards now refresh every 3 minutes instead of 30 seconds",
        "Rebalanced midgame",
        "Optimized game performance",
        "You can now change your empire name with in-game currency or Robux",
        "Softcaps are now introduced at high amounts of each currency",
    ]),
    new Changelog("1.0 - Full Release", [
        "Added difficulties and items Automatic to Easy",
        "Added new areas",
        "Added many more crafting items",
        "Added level leaderboard",
        "Updated leaderboards to look cleaner",
        "Revamped UI",
        "Removed Miscellaneous, changed all misc items to have their own respective difficulties",
        "Added new quests",
        "Added new materials for crafting",
    ]),
];

function EntryLabel({ text }: { text: string }) {
    return (
        <textlabel
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            FontFace={RobotoMono}
            Size={new UDim2(1, 0, 0, 0)}
            Text={text}
            TextColor3={Color3.fromRGB(195, 195, 195)}
            TextScaled={true}
            TextSize={25}
            TextWrapped={true}
            TextXAlignment={Enum.TextXAlignment.Left}
            TextYAlignment={Enum.TextYAlignment.Top}
        >
            <uistroke Thickness={2} />
            <uitextsizeconstraint MaxTextSize={50} />
        </textlabel>
    );
}

function TitleLabel({ text }: { text: string }) {
    return (
        <textlabel
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            FontFace={RobotoMonoBold}
            Size={new UDim2(1, 0, 0, 0)}
            Text={text}
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextSize={70}
            TextWrapped={true}
            TextXAlignment={Enum.TextXAlignment.Left}
            TextYAlignment={Enum.TextYAlignment.Top}
        >
            <uistroke Thickness={2} />
        </textlabel>
    );
}

export function ChangelogGui() {
    const elements = new Array<JSX.Element>();
    const reverseChangelogs = new Array<Changelog>();
    for (let i = CHANGELOGS.size() - 1; i >= 0; i--) {
        reverseChangelogs.push(CHANGELOGS[i]);
    }
    for (const changelog of reverseChangelogs) {
        elements.push(<TitleLabel text={changelog.version} />);
        for (const entry of changelog.entries) {
            elements.push(<EntryLabel text={`• ${entry}`} />);
        }
    }

    return (
        <surfacegui
            Adornee={ChangelogPart.waitForInstance()}
            ClipsDescendants={true}
            LightInfluence={1}
            MaxDistance={200}
            ResetOnSpawn={false}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 0.1, 0)}
                Text="Changelog"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={4}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
            <uipadding PaddingLeft={new UDim(0, 50)} PaddingRight={new UDim(0, 50)} PaddingTop={new UDim(0, 25)} />
            <scrollingframe
                Active={true}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                ScrollBarImageColor3={Color3.fromRGB(0, 0, 0)}
                Size={new UDim2(1, 0, 0.8, 0)}
            >
                {elements}
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <uipadding />
            </scrollingframe>
        </surfacegui>
    );
}
