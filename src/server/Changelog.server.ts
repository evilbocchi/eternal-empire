import { ASSETS } from "shared/asset/GameAssets";
import { AREAS } from "shared/Area";

declare global {
    interface Assets {
        Changelog: Frame & {
            EntryLabel: TextLabel;
            TitleLabel: TextLabel;
        };
    }
}

class Changelog {
    readonly version: string;
    readonly entries: string[];

    constructor(version: string, entries: string[]) {
        this.version = version;
        this.entries = entries;
    }
}

const CHANGELOGS = [
    new Changelog("0.1 - Initial Release", [
        "Released game :)))"
    ]),
    new Changelog("0.2 - Change of Scenery", [
        "Changed Place icon in Build Mode",
        "Implemented Basic Charger",
        "Stud",
        "Added some cool OSTs",
        "Added portal to next island",
        "Did some lighting changes"
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
        "Added track Melodic Romance to Barren Islands"
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
        "dded crafting and materials system",
        "More coming soon in v0.6...",
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
        "Softcaps are now introduced at high amounts of each currency"
    ]),
    new Changelog("1.0 - Full Release", [
        "Added difficulties and items Automatic to x",

    ]),
];

const UPDATE_LIST = AREAS.BarrenIslands.areaFolder.FindFirstChild("UpdateBoard")?.FindFirstChild("GuiPart")?.FindFirstChild("SurfaceGui")?.FindFirstChild("ScrollingFrame");

let i = 9999;
for (const changelog of CHANGELOGS) {
    const frame = new Instance("Frame");
    frame.Size = new UDim2(1, 0, 0, 0);
    frame.AutomaticSize = Enum.AutomaticSize.Y;
    frame.BackgroundTransparency = 1;
    frame.LayoutOrder = --i;

    const uiListLayout = new Instance("UIListLayout");
    uiListLayout.SortOrder = Enum.SortOrder.LayoutOrder;
    uiListLayout.Parent = frame;

    const titleLabel = ASSETS.Changelog.TitleLabel.Clone();
    titleLabel.Text = changelog.version;
    titleLabel.LayoutOrder = -1;
    titleLabel.Parent = frame;

    for (const entry of changelog.entries) {
        const entryLabel = ASSETS.Changelog.EntryLabel.Clone();
        entryLabel.Text = entry;
        entryLabel.Parent = frame;
    }

    frame.Parent = UPDATE_LIST;
}