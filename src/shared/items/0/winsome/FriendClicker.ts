import { loadAnimation } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Clicker from "shared/item/traits/action/Clicker";
import Boostable from "shared/item/traits/boost/Boostable";
import Generator from "shared/item/traits/generator/Generator";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import WinsomeCoagulate from "shared/items/0/winsome/WinsomeCoagulate";

export = new Item(script.Name)
    .setName("Friend Clicker")
    .setDescription("Your friend is here to help! Place in front of your structure for %cps%.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 1000), 1)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 3000), 2)
    .setRequiredItemAmount(WinsomeCoagulate, 5)
    .addPlaceableArea("BarrenIslands")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Clicker)
    .setClickRate(1)
    .setClickValue(1000)
    .replicateClicks()

    .trait(Boostable)
    .trait(Generator)
    .exit()

    .onClientLoad((model, item) => {
        const friend = model.WaitForChild("Friend") as Model;
        const animationController = friend.FindFirstChildOfClass("AnimationController");
        if (animationController === undefined) return;
        const animTrack = loadAnimation(animationController, 16920778613);
        if (animTrack !== undefined) {
            item.trait(Clicker).fromServerClicked(model, () => animTrack.Play());
        }
    });
