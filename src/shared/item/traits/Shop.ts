import type ShopController from "client/controllers/interface/ShopController";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Shop: Shop;
    }

    interface ShopAssets {
        ShopGui: SurfaceGui & {
            FilterOptions: FilterOptions;
            ItemList: ScrollingFrame & {
                UIStroke: UIStroke;
                BuyAll: Frame & {
                    Button: TextButton;
                };
            };
        };
        PriceOptionsContainer: Frame;
        PriceOption: Frame & {
            ImageLabel: ImageLabel;
            ViewportFrame: ViewportFrame;
            AmountLabel: TextLabel;
        };
        ItemSlot: ItemSlot & {};
    }

    interface Assets {
        ShopWindow: ShopAssets;
    }
}

export default class Shop extends ItemTrait {
    items: Item[] = [];

    /**
     * Loads the shop model.
     *
     * @see {@link ShopController} for the client-side controller that manages the shop.
     *
     * @param model The model of the shop item.
     * @param _shop The shop instance that will manage the model.
     */
    static load(model: Model, _shop: Shop) {
        const touchPart = (model.FindFirstChild("TouchPart") as BasePart | undefined) ?? model.PrimaryPart;
        if (touchPart === undefined) {
            warn("Shop model does not have a TouchPart or PrimaryPart.");
            return;
        }

        touchPart.CanTouch = true;
        touchPart.Touched.Connect(() => {});
        if (touchPart.Name === "TouchPart") {
            touchPart.AddTag("Unhoverable");
        }
        touchPart.AddTag("Shop");
    }

    constructor(item: Item) {
        super(item);
        item.persists();
        item.onLoad((model) => Shop.load(model, this));
    }

    setItems(items: Item[]) {
        this.items = items;
        return this;
    }
}
