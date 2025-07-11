import { TweenService } from "@rbxts/services";
import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import SmallReactor from "shared/items/negative/unimpossible/SmallReactor";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Compact Reactor")
.setDescription("Okay, that is NOT compact. Seriously, who came up with these naming schemes? Well, it's your problem now. Have fun rearranging your setup for a %mul% boost.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 40e15), 1)
.setRequiredItemAmount(SmallReactor, 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 5.5))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
.onLoad((model) => {
    const spin = model.WaitForChild("Spin") as BasePart;
    const tween = TweenService.Create(spin, new TweenInfo(2, Enum.EasingStyle.Linear), {Rotation: new Vector3(0, 360, 0)});
    const loop = tween.Completed.Connect(() => tween.Play());
    tween.Play();
    model.Destroying.Once(() => loop.Disconnect());
})