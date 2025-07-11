import Difficulty from "shared/Difficulty";
import { Manumatic } from "shared/item/Special";
import Price from "shared/Price";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";

const animTrackPerModel = new Map<Model, AnimationTrack>();

export = new Manumatic.Clicker("NoobClicker")
.setName("Noob Clicker")
.setDescription("Noobs clicking your awesome tower for you.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Funds", 30e18).setCost("Purifier Clicks", 100), 1)
.setPrice(new Price().setCost("Funds", 90e18).setCost("Purifier Clicks", 300), 2)
.addPlaceableArea("BarrenIslands")

.setCPS(3)
.onLoad((model) => {
    const noob = model.WaitForChild("Noob") as Model;
    const humanoid = noob.FindFirstChildOfClass("Humanoid");
    if (humanoid === undefined) {
        return;
    }
    const animator = humanoid.FindFirstChildOfClass("Animator");
    if (animator === undefined) {
        return;
    }
    const animTrack = loadAnimation(humanoid, 16920778613);
    if (animTrack !== undefined) {
        animTrackPerModel.set(model, animTrack);
        model.Destroying.Once(() => animTrackPerModel.delete(model));
    }
})
.setOnClick((model: Model) => {
    const animTrack = animTrackPerModel.get(model);
    if (animTrack !== undefined) {
        animTrack.Play();
    }
});