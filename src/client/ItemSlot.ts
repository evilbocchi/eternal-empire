import Difficulty from "@antivivi/jjt-difficulties";
import { FuzzySearch } from "@rbxts/fuzzy-search";
import { PARALLEL } from "client/constants";
import { AREAS } from "shared/Area";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

declare global {
    type ItemSlot = TextButton & {
        UIStroke: UIStroke,
        AmountLabel: TextLabel,
        ViewportFrame: ViewportFrame & {
            Camera: Camera;
        },
        ImageLabel: ImageLabel;
    };

    type ItemListContainer = Frame & {
        ItemList: ScrollingFrame & {
            UIGridLayout: UIGridLayout;
        };
    };

    interface Assets {
        ItemListContainer: Folder & {
            ItemSlot: ItemSlot;
        };
    }

    type TraitFilterId = keyof (typeof FILTERABLE_TRAITS);
}

export const FILTERABLE_TRAITS = {
    Dropper: false,
    Furnace: false,
    Upgrader: false,
    Conveyor: false,
    Generator: false,
    Charger: false,
    Miscellaneous: false,
};

namespace ItemSlot {

    const ITEM_PER_NAME = (function () {
        const itemPerName = new Map<string, Item>();
        for (const [_, item] of Items.itemsPerId) {
            itemPerName.set(item.name, item);
        }
        return itemPerName;
    })();

    /**
     * Loads the color, layout order, and image of an item slot.
     * 
     * @param item The item to create the slot for.
     * @returns The item slot.
     */
    export function loadItemSlot<T extends ItemSlot>(itemSlot: T, item: Item) {
        const difficulty = item.difficulty;
        colorItemSlot(itemSlot, difficulty);
        itemSlot.LayoutOrder = difficulty.rating ?? 0;
        if (item.image !== undefined)
            itemSlot.ImageLabel.Image = item.image;
        else
            loadViewportFrame(itemSlot.ViewportFrame, item);
        itemSlot.Name = item.id;
        return itemSlot;
    }

    /**
     * Finds the best number of cells to display on the x-axis of a container, such that the cells are as large as possible.
     * 
     * @param containerX The width of the container.
     * @returns The optimal number of cells to display.
     */
    export function calculateOptimalCellCount(containerX: number): number {
        return math.max(math.round((containerX - 50) / 65), 3);
    }

    /**
     * Loads a viewport frame with an item model.
     * 
     * @param viewportFrame The viewport frame to load the model into.
     * @param item The item to load.
     */
    export function loadViewportFrame(viewportFrame: ViewportFrame, item: Item) {
        PARALLEL.SendMessage("LoadViewportFrame", viewportFrame, item.id);
    }

    /**
     * Checks if the item has any of the whitelisted traits enabled.
     * If the Miscellaneous trait is enabled, it will return true if no other traits are found.
     * 
     * @param item The item to check.
     * @param whitelistedTraits The traits to check for.
     * @returns Whether the item is whitelisted.
     */
    export function isWhitelisted(item: Item, whitelistedTraits: { [trait in TraitFilterId]: boolean }) {
        let traitFound = false;
        for (const [trait, enabled] of pairs(whitelistedTraits)) {
            if (trait === "Miscellaneous")
                continue;

            if (item.findTrait(trait) !== undefined) {
                traitFound = true;
                if (enabled)
                    return true;
            }
        }
        return !traitFound && whitelistedTraits.Miscellaneous;
    }

    /**
     * Filters the item slots based on the query and whitelisted traits.
     * 
     * @param itemSlotsPerItem Item slots per item.
     * @param items The allowed items to display. Any other items will be hidden.
     * @param query The search query to filter by. Uses fuzzy search and sorts by relevance.
     * @param whitelistedTraits The traits to filter by. If a trait is enabled, only items with that trait will be shown.
     */
    export function filterItems(itemSlotsPerItem: Map<Item, ItemSlot>, items: Item[], query: string, whitelistedTraits: { [trait in TraitFilterId]: boolean }) {
        let whitelistEnabled = false;
        for (const [_, enabled] of pairs(whitelistedTraits)) {
            if (enabled) {
                whitelistEnabled = true;
                break;
            }
        }

        if (query !== "") {
            const terms = new Array<string>();
            for (const item of items) {
                terms.push(item.name);
            }
            const sorted = FuzzySearch.Sorting.FuzzyScore(terms, query);
            for (const [index, term] of sorted) {
                const item = ITEM_PER_NAME.get(term)!;
                const itemSlot = itemSlotsPerItem.get(item);
                if (itemSlot === undefined)
                    continue;
                let visible = index > 0;
                if (whitelistEnabled && visible)
                    visible = isWhitelisted(item, whitelistedTraits);
                itemSlot.LayoutOrder = index;
                itemSlot.Visible = visible;
            }
            return;
        }

        for (const [item, itemSlot] of itemSlotsPerItem) {
            const index = items.indexOf(item);
            let visible = index > -1;
            if (whitelistEnabled && visible)
                visible = isWhitelisted(item, whitelistedTraits);
            itemSlot.LayoutOrder = index;
            itemSlot.Visible = visible;
        }
    }

    /**
     * Colors an item slot based on the difficulty of the item.
     * 
     * @param itemSlot The item slot to color.
     * @param difficulty The difficulty to color the item slot with.
     */
    export function colorItemSlot(itemSlot: ItemSlot, difficulty: Difficulty) {
        let color = difficulty.color ?? new Color3();
        color = color ? new Color3(math.clamp(color.R, 0.1, 0.9), math.clamp(color.G, 0.1, 0.9), math.clamp(color.B, 0.1, 0.9)) : new Color3();
        itemSlot.UIStroke.Color = color;
        itemSlot.BackgroundColor3 = color;
    }

    /**
     * Colors the difficulty label based on the difficulty of the item.
     * 
     * @param difficultyLabel A label to color.
     * @param difficulty The difficulty to color the label with.
     */
    export function loadDifficultyLabel(difficultyLabel: DifficultyLabel, difficulty: Difficulty) {
        const color = difficulty.color;

        const imageLabel = difficultyLabel.ImageLabel;
        imageLabel.Image = "rbxassetid://" + difficulty.image;
        if (color !== undefined) {
            imageLabel.BackgroundColor3 = color;
            imageLabel.BackgroundTransparency = 0;
        }
        else {
            imageLabel.BackgroundTransparency = 1;
        }
        
        difficultyLabel.TextLabel.TextColor3 = color === undefined ? new Color3() : color.Lerp(new Color3(1, 1, 1), 0.5);
        difficultyLabel.TextLabel.Text = difficulty.name ?? "error";
    }

    export function hookMetadata(metadataPerItem: Map<Item, ItemMetadata>) {
        Packets.boostChanged.connect((value) => {
            for (const [itemId, boost] of value) {
                const item = Items.getItem(itemId);
                if (item === undefined)
                    continue;
                const metadata = metadataPerItem.get(item);
                if (metadata === undefined)
                    continue;
                metadata.spacing();
                metadata.formula(undefined, boost);
            }
        });

        AREAS.SlamoVillage.unlocked.Changed.Connect(() => {
            for (const [_, metadata] of metadataPerItem) {
                metadata.spacing();
                metadata.placeableAreas();
                metadata.resetLayer();
            }
        });

        Packets.level.observe((level) => {
            for (const [_, metadata] of metadataPerItem) {
                metadata.levelReq(level);
            }
        });
    }
}

export default ItemSlot;