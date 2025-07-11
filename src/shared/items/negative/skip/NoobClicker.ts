import Difficulty from "@antivivi/jjt-difficulties";
import { Manumatic } from "shared/item/Special";
import Price from "shared/Price";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";

export = new Manumatic.Clicker("NoobClicker")
.setName("Noob Clicker")
.setDescription("Noobs clicking your awesome tower for you.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Funds", 30e18).setCost("Purifier Clicks", 100), 1)
.setPrice(new Price().setCost("Funds", 90e18).setCost("Purifier Clicks", 300), 2)
.addPlaceableArea("BarrenIslands")

.setCPS(3)
.onLoad((model) => Manumatic.Clicker.createClickRemote(model))
.onClientLoad((model) => {
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
        (model.WaitForChild("ClickEvent") as UnreliableRemoteEvent).OnClientEvent.Connect(() => animTrack.Play());
    }
})
.setOnClick((model: Model) => {
    const clickEvent = model.FindFirstChild("ClickEvent");
    if (clickEvent !== undefined) {
        (clickEvent as UnreliableRemoteEvent).FireAllClients();
    }
});