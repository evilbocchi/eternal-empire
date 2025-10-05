import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Bismuth from "shared/items/excavation/Bismuth";
import Boracite from "shared/items/excavation/Boracite";
import Crystal from "shared/items/excavation/Crystal";
import Diamond from "shared/items/excavation/Diamond";
import Emerald from "shared/items/excavation/Emerald";
import Gold from "shared/items/excavation/Gold";
import Ion from "shared/items/excavation/Ion";
import Iron from "shared/items/excavation/Iron";
import Jade from "shared/items/excavation/Jade";
import Nissonite from "shared/items/excavation/Nissonite";
import Obsidian from "shared/items/excavation/Obsidian";
import Quartz from "shared/items/excavation/Quartz";
import Ruby from "shared/items/excavation/Ruby";
import Sapphire from "shared/items/excavation/Sapphire";
import Starlight from "shared/items/excavation/Starlight";
import Uranium from "shared/items/excavation/Uranium";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Orpiment from "shared/items/excavation/Orpiment";
import Tetra from "shared/items/excavation/Tetra";
import Volt from "shared/items/excavation/Volt";
import Aquamarine from "shared/items/excavation/Aquamarine";
import Lollipop from "shared/items/excavation/Lollipop";
import CORR8PT10N from "shared/items/excavation/CORR8PT10N";
import StargazedMetal from "shared/items/excavation/StargazedMetal";
import Gyge from "shared/items/excavation/Gyge";
import AulyPlate from "shared/items/excavation/AulyPlate";
import ShellPiece from "shared/items/excavation/ShellPiece";
import Singularity from "shared/items/excavation/Singularity";
import CapsuledSingularity from "shared/items/excavation/CapsuledSingularity";

const ExcavationStone = new Item(script.Name)
    .setName("Stone")
    .setDescription("A basic crafting resource, found littered everywhere around the world.")
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();

ExcavationStone.trait(Shop).setItems([
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
]);

export = ExcavationStone;
