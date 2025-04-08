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
        ItemSlot: ItemSlot & {

        };
    }

    interface Assets {
        ShopWindow: ShopAssets;
    }
}

export default class Shop extends ItemTrait {

    items: Item[] = [];

    constructor(item: Item) {
        super(item);
        item.persists();
        item.onLoad((model, item) => {
            model.PrimaryPart?.Touched.Connect(() => { }); // add touch interest
        });
    }

    setItems(items: Item[]) {
        this.items = items;
        return this;
    }
}