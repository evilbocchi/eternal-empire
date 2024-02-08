import Price from "shared/Price";
import { PlacedItem } from "shared/constants";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

interface ItemUtils {
    getPlacedItems: () => Folder,
    getBalance: () => Price,
    setBalance: (bal: Price) => void,
    calculateGain: (droplet: BasePart, furnace?: Furnace, model?: Model) => Price | undefined,
    applyFormula: (callback: (value: Price) => unknown, x: () => InfiniteMath, formula: (x: InfiniteMath) => Price) => void,
    getPlacedItem: (placementId: string) => PlacedItem | undefined
}

export = ItemUtils;