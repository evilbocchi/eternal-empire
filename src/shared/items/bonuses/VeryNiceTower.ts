import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";

export = new Item(script.Name)
.setName("30/30 rated tower 😱")
.setDescription("you will not last 5 SECONDS in this tower")
.setDifficulty(Difficulty.Bonuses)
.setPrice(new Price().setCost("Funds", 10), 1)
