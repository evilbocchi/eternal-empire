/**
 * @fileoverview
 * Provides UI logic for filtering items in the item slot container.
 * Handles trait-based filtering, search input, and related UI feedback (animations, sounds).
 * Exports the ItemFilter namespace with a single function to initialize and manage filter options.
 */

import { TweenService } from "@rbxts/services";
import { FILTERABLE_TRAITS } from "client/ItemSlot";
import { getAsset } from "shared/asset/AssetMap";
import { getSound } from "shared/asset/GameAssets";

declare global {

    /**
     * Component for filtering items in the item slot container.
     * Contains trait options and a search box for filtering items based on traits and names.
     */
    type FilterOptions = Frame & {
        TraitOptions: Frame & {
            [traitName in keyof ItemTraits]: ImageButton;
        } & {
            Miscellaneous: ImageButton;
        };
        Search: TextBox & {
            Action: ImageButton;
        };
    };
}

/**
 * Namespace for item filtering logic.
 */
namespace ItemFilter {

    /**
     * Loads filter options for the item slot container.
     * 
     * @param filterOptions Filter options frame.
     * @param callback Callback that is called when the filter options change.
     * @returns Function that fetches the current filter options, calling the callback.
     */
    export function loadFilterOptions(filterOptions: FilterOptions, callback: (query: string, whitelistedTraits: { [trait in TraitFilterId]: boolean }) => void) {
        const filterItems = () => {
            for (const [trait, enabled] of pairs(whitelistedTraits)) {
                const traitOption = filterOptions.TraitOptions.FindFirstChild(trait) as ImageButton | undefined;
                if (traitOption === undefined)
                    continue;
                traitOption.SetAttribute("Selected", enabled);
            }
            callback(search.Text, whitelistedTraits);
        };

        const whitelistedTraits = table.clone(FILTERABLE_TRAITS);
        const search = filterOptions.Search;
        const searchAction = search.Action;

        let previousText = search.Text;
        search.GetPropertyChangedSignal("Text").Connect(() => {
            const text = search.Text;
            if (text.size() > previousText.size()) {
                switch (math.random(1, 4)) {
                    case 1:
                        getSound("KeyPress1.mp3").Play();
                        break;
                    case 2:
                        getSound("KeyPress2.mp3").Play();
                        break;
                    case 3:
                        getSound("KeyPress3.mp3").Play();
                        break;
                    case 4:
                        getSound("KeyPress4.mp3").Play();
                        break;
                }
            }
            else {
                getSound("KeyDelete.mp3").Play();
            }

            if (text === "") {
                searchAction.Image = getAsset("assets/indexing/Search.png");
            }
            else {
                searchAction.Image = getAsset("assets/indexing/Clear.png");
            }
            filterItems();
        });

        searchAction.MouseEnter.Connect(() => {
            TweenService.Create(searchAction, new TweenInfo(0.2), { ImageTransparency: 0 }).Play();
        });
        searchAction.MouseLeave.Connect(() => {
            TweenService.Create(searchAction, new TweenInfo(0.2), { ImageTransparency: 0.5 }).Play();
        });
        searchAction.Activated.Connect(() => {
            search.Text = "";
            search.CaptureFocus();
            getSound("Click.mp3").Play();
        });

        for (const traitOption of filterOptions.TraitOptions.GetChildren()) {
            if (!traitOption.IsA("GuiButton"))
                continue;

            const key = traitOption.IsA("ImageButton") ? "ImageTransparency" : "TextTransparency";

            let hovering = false;
            const update = () => TweenService.Create(traitOption, new TweenInfo(0.2), {
                [key]: traitOption.GetAttribute("Selected") ? 0 : (hovering ? 0.25 : 0.5)
            }).Play();

            traitOption.MouseEnter.Connect(() => {
                hovering = true;
                update();
            });
            traitOption.MouseLeave.Connect(() => {
                hovering = false;
                update();
            });
            traitOption.Activated.Connect(() => {
                getSound("MenuClick.mp3").Play();
                const trait = traitOption.Name as TraitFilterId;
                if ((trait as string) === "Clear") {
                    for (const [trait, _enabled] of pairs(whitelistedTraits)) {
                        whitelistedTraits[trait] = false;
                    }
                }
                else {
                    whitelistedTraits[trait] = !whitelistedTraits[trait];
                }
                filterItems();
                update();
            });
            traitOption.GetAttributeChangedSignal("Selected").Connect(update);
        }

        return filterItems;
    }
}

export = ItemFilter;