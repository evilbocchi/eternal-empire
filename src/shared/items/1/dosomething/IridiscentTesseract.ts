import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import Bismuth from "shared/items/excavation/Bismuth";
import Crystal from "shared/items/excavation/Crystal";
import Diamond from "shared/items/excavation/Diamond";
import Emerald from "shared/items/excavation/Emerald";
import Gold from "shared/items/excavation/Gold";
import Ion from "shared/items/excavation/Ion";
import Jade from "shared/items/excavation/Jade";
import Obsidian from "shared/items/excavation/Obsidian";
import Ruby from "shared/items/excavation/Ruby";
import Sapphire from "shared/items/excavation/Sapphire";
import Starlight from "shared/items/excavation/Starlight";
import Uranium from "shared/items/excavation/Uranium";

export = new Item(script.Name)
    .setName("Iridiscent Tesseract")
    .setDescription("A singular tesseract of empyrean composition. Activates matter unknown to mortals.")
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Wins", 1), 1)
    .setRequiredItemAmount(Crystal, 100)
    .setRequiredItemAmount(Gold, 100)
    .setRequiredItemAmount(Jade, 75)
    .setRequiredItemAmount(Obsidian, 75)
    .setRequiredItemAmount(Ruby, 50)
    .setRequiredItemAmount(Emerald, 25)
    .setRequiredItemAmount(Sapphire, 25)
    .setRequiredItemAmount(Diamond, 10)
    .setRequiredItemAmount(Starlight, 10)
    .setRequiredItemAmount(Ion, 10)
    .setRequiredItemAmount(Uranium, 5)
    .setRequiredItemAmount(Bismuth, 1)
    .setCreator("sanjay2133")
    .persists()

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Skill", 10).set("Dark Matter", 20))

    .exit();
