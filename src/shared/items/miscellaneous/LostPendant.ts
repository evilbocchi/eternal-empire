import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Shop from "shared/item/Shop";

const item = new Shop("LostPendant")
.setName("Lost Pendant")
.setDescription("Located atop a peculiar hill. Seems to have no materialistic value.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Funds", 0), 1);
item.setItems([item]);

export = item;