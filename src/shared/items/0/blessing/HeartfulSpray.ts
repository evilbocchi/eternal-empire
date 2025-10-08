import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Heartful Spray")
    .setDescription("Made with love &lt;3 Restores %hp_add% to droplets.")
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Skill", 5).set("Power", 5e15).set("Funds", 10e27), 1)
    .setPrice(new CurrencyBundle().set("Skill", 8).set("Power", 8e15).set("Funds", 40e27), 2)
    .setPrice(new CurrencyBundle().set("Skill", 11).set("Power", 20e15).set("Funds", 90e27), 3)
    .setPrice(new CurrencyBundle().set("Skill", 18).set("Power", 60e15).set("Funds", 250e27), 4)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Upgrader)

    .trait(Damager)
    .setDamage(-20)

    .exit();
