import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Aquamarine from "shared/items/excavation/Aquamarine";
import AulyPlate from "shared/items/excavation/AulyPlate";
import Bismuth from "shared/items/excavation/Bismuth";
import Boracite from "shared/items/excavation/Boracite";
import CapsuledSingularity from "shared/items/excavation/CapsuledSingularity";
import CORR8PT10N from "shared/items/excavation/C0RR8PT10N";
import Crystal from "shared/items/excavation/Crystal";
import Diamond from "shared/items/excavation/Diamond";
import Emerald from "shared/items/excavation/Emerald";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import Gyge from "shared/items/excavation/Gyge";
import Ion from "shared/items/excavation/Ion";
import Iron from "shared/items/excavation/Iron";
import Jade from "shared/items/excavation/Jade";
import Lollipop from "shared/items/excavation/Lollipop";
import Nissonite from "shared/items/excavation/Nissonite";
import Obsidian from "shared/items/excavation/Obsidian";
import Orpiment from "shared/items/excavation/Orpiment";
import Quartz from "shared/items/excavation/Quartz";
import Ruby from "shared/items/excavation/Ruby";
import Sapphire from "shared/items/excavation/Sapphire";
import ShellPiece from "shared/items/excavation/ShellPiece";
import Singularity from "shared/items/excavation/Singularity";
import StargazedMetal from "shared/items/excavation/StargazedMetal";
import Starlight from "shared/items/excavation/Starlight";
import Tetra from "shared/items/excavation/Tetra";
import Uranium from "shared/items/excavation/Uranium";
import Volt from "shared/items/excavation/Volt";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Excavation Shop")
    .setDescription("A shop that sells minerals.")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .setItems([
        ExcavationStone,
        WhiteGem,
        Crystal,
        Iron,
        Gold,
        Quartz,
        Jade,
        Obsidian,
        Ruby,
        Emerald,
        Sapphire,
        Diamond,
        Starlight,
        Ion,
        Uranium,
        Bismuth,
        Boracite,
        Nissonite,
        Orpiment,
        Tetra,
        Volt,
        Aquamarine,
        Lollipop,
        CORR8PT10N,
        StargazedMetal,
        Gyge,
        AulyPlate,
        ShellPiece,
        Singularity,
        CapsuledSingularity,
    ])

    .exit();
