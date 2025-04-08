import { TweenService } from "@rbxts/services";
import { FILTERABLE_TRAITS } from "client/ItemSlot";

declare global {
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
                const traitOption = filterOptions.TraitOptions.FindFirstChild(trait) as GuiButton | undefined;
                if (traitOption === undefined)
                    continue;
                traitOption.SetAttribute("Selected", enabled);
            }
            callback(search.Text, whitelistedTraits);
        };

        const whitelistedTraits = table.clone(FILTERABLE_TRAITS);
        const search = filterOptions.Search;
        const searchAction = search.Action;

        search.GetPropertyChangedSignal("Text").Connect(() => {
            const text = search.Text;
            if (text === "") {
                searchAction.Image = "rbxassetid://5492253050"; // search
            }
            else {
                searchAction.Image = "rbxassetid://9545003266"; // clear
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