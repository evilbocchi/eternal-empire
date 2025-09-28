import Difficulty from "@antivivi/jjt-difficulties";
import { getAllInstanceInfo, loadAnimation } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Clicker from "shared/item/traits/action/Clicker";
import Boostable from "shared/item/traits/boost/Boostable";
import Generator from "shared/item/traits/generator/Generator";

export = new Item(script.Name)
    .setName("Noob Clicker")
    .setDescription("Noobs clicking your awesome tower for you. Place in front of your structure for %cps%.")
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Funds", 30e18).set("Purifier Clicks", 100), 1)
    .setPrice(new CurrencyBundle().set("Funds", 90e18).set("Purifier Clicks", 300), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Clicker)
    .setClickRate(3)
    .replicateClicks()

    .trait(Boostable)
    .trait(Generator)
    .addToWhitelist("RadioNoob")
    .exit()

    // radio noob effect
    .onLoad((model) => {
        const modifier = { multi: 200000 };
        const modelInfo = getAllInstanceInfo(model);
        modelInfo.Chargeable = true;
        modelInfo.BoostAdded!.add(() => modelInfo.ClickRateModifiers?.add(modifier));
        modelInfo.BoostRemoved!.add(() => modelInfo.ClickRateModifiers?.delete(modifier));
    })
    .onClientLoad((model, item) => {
        const noob = model.WaitForChild("Noob") as Model;
        const animationController = noob.FindFirstChildOfClass("AnimationController");
        if (animationController === undefined) return;
        const animTrack = loadAnimation(animationController, 16920778613);
        if (animTrack !== undefined) {
            item.trait(Clicker).fromServerClicked(model, () => animTrack.Play());
        }
    });
