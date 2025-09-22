import Difficulty from "@antivivi/jjt-difficulties";
import { TweenService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import SmallReactor from "shared/items/negative/unimpossible/SmallReactor";

export = new Item(script.Name)
    .setName("Compact Reactor")
    .setDescription(
        "Okay, that is NOT compact. Seriously, who came up with these naming schemes? Well, it's your problem now. Have fun rearranging your setup for a %mul% boost.",
    )
    .setDifficulty(Difficulty.ReversedPeripherality)
    .setPrice(new CurrencyBundle().set("Funds", 40e15), 1)
    .setRequiredItemAmount(SmallReactor, 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 5.5))

    .trait(Conveyor)
    .setSpeed(5)
    .exit()

    .onLoad((model) => {
        const spin = model.WaitForChild("Spin") as BasePart;
        const tween = TweenService.Create(spin, new TweenInfo(2, Enum.EasingStyle.Linear), {
            Rotation: new Vector3(0, 360, 0),
        });
        const loop = tween.Completed.Connect(() => tween.Play());
        tween.Play();
        model.Destroying.Once(() => loop.Disconnect());
        eat(loop, "Disconnect");
    });
