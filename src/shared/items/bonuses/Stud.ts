import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import SuspiciousStud from "shared/items/bonuses/SuspiciousStud";

export = new Item(script.Name)
    .setName("Stud")
    .setDescription("Stud")
    .setDifficulty(Difficulty.Bonuses)
    .setPrice(new CurrencyBundle().set("Funds", 1), 1)
    .soldAt(SuspiciousStud);
