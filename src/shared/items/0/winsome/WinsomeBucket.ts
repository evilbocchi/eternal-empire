import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";
import SkillPod from "shared/items/miscellaneous/SkillPod";

export = new Item(script.Name)
.setName("Winsome Bucket")
.setDescription("I don't ever know why you need a bucket of Winsome. Just know that it exists and is there to emotionally support you.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Funds", 1), 1)
.setRequiredHarvestableAmount("WinsomeSpeck", 10)
.setRequiredItemAmount(SkillPod, 1);