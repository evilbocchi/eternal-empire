import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import { Manumatic } from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";

const animTrackPerModel = new Map<Model, AnimationTrack>();

export = new Manumatic.Clicker("SlamoClicker")
.setName("Slamo Clicker")
.setDescription("Slamos click pretty well at 20 CPS.")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.4, 24])).setCost("Purifier Clicks", 10000), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([2.9, 18])).setCost("Purifier Clicks", 30000), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setCPS(4)
.setClickValue(5)
.onLoad((model) => {
    const slamo = model.WaitForChild("Slamo") as Model;
    const humanoid = slamo.FindFirstChildOfClass("Humanoid");
    if (humanoid === undefined) {
        return;
    }
    const animator = humanoid.FindFirstChildOfClass("Animator");
    if (animator === undefined) {
        return;
    }
    const animTrack = loadAnimation(humanoid, 17441475234);
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