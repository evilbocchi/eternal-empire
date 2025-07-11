import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Charm from "shared/item/Charm";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";

export = new Charm(script.Name)
.setName("Winsome Charm")
.setDescription("If you're ever feeling down, just know that Winsome is here for you. +3% chance to inflict critical hits with tools.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Funds", 1), 1)
.setRequiredHarvestableAmount("WinsomeSpeck", 25)
.setRequiredItemAmount(EnchantedGrass, 10)

.setCriticalAdd(3);