import Price from "shared/Price";
import { PlacedItem } from "shared/constants";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import Item from "./Item";

interface ItemUtils {
    getPlacedItems: () => Folder;
    getBalance: () => Price;
    setBalance: (bal: Price) => void;
    calculateRawDropletValue: (droplet: BasePart) => Price | undefined;
    calculateDropletValue: (droplet: BasePart) => [Price | undefined, Price | undefined];
    applyFormula: (callback: (value: Price) => unknown, x: () => InfiniteMath, formula: (x: InfiniteMath) => Price) => void;
    getPlacedItem: (placementId: string) => PlacedItem | undefined;
    getItem: (itemId: string) => Item | undefined;
    getAmountPerUpgrade: () => {[upgradeId: string]: number};
    setUpgradeAmount: (upgradeId: string, amount: number) => void;

}

export = ItemUtils;