import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Clickable: Clickable;
    }
}

export default class Clickable extends ItemTrait {
    debounce = 0.1;
    onClick: ((model: Model, clickable: Clickable, player: Player | undefined, value: number) => void) | undefined;

    setDebounce(debounce: number) {
        this.debounce = debounce;
        return this;
    }

    setOnClick(onClick: (model: Model, clickable: Clickable, player: Player | undefined, value: number) => void) {
        this.onClick = onClick;
        return this;
    }
}
