import Difficulty from "@rbxts/ejt";
import { loadAnimation } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Clicker from "shared/item/traits/action/Clicker";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Slamo Clicker")
    .setDescription("Slamos click pretty well at %cps%.")
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Funds", 1.4e24).set("Purifier Clicks", 10000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 2.9e24).set("Purifier Clicks", 30000), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Clicker)
    .setClickRate(5)
    .setClickValue(16)
    .replicateClicks()
    .exit()

    .onClientLoad((model, item) => {
        const slamo = model.WaitForChild("Slamo") as Model;
        const animationController = slamo.FindFirstChildOfClass("AnimationController");
        if (animationController === undefined) return;
        const animTrack = loadAnimation(animationController, 17441475234);
        if (animTrack !== undefined) {
            item.trait(Clicker).fromServerClicked(model, () => animTrack.Play());
        }
    });
