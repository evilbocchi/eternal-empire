import Difficulty from "@antivivi/jjt-difficulties";
import { Manumatic } from "shared/item/Special";
import Price from "shared/Price";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";


export = new Manumatic.Clicker(script.Name)
.setName("Slamo Clicker")
.setDescription("Slamos click pretty well at 80 CPS.")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", 1.4e24).setCost("Purifier Clicks", 10000), 1)
.setPrice(new Price().setCost("Funds", 2.9e24).setCost("Purifier Clicks", 30000), 2)
.addPlaceableArea("BarrenIslands")

.setCPS(5)
.setClickValue(16)
.onLoad((model) => Manumatic.Clicker.createClickRemote(model))
.onClientLoad((model) => {
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
        (model.WaitForChild("ClickEvent") as UnreliableRemoteEvent).OnClientEvent.Connect(() => animTrack.Play());
    }
})
.setOnClick((model: Model) => {
    const clickEvent = model.FindFirstChild("ClickEvent");
    if (clickEvent !== undefined) {
        (clickEvent as UnreliableRemoteEvent).FireAllClients();
    }
});