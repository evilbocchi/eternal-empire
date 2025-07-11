import Difficulty from "@antivivi/jjt-difficulties";
import Shop from "shared/item/Shop";
import Price from "shared/Price";

const item = new Shop("Wool")
.setName("Wool")
.setDescription("Wool for the masses.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Funds", 24e12).setCost("Power", 100));
item.setItems([item]);

export = item;