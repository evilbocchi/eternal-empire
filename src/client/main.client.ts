import { Flamework } from "@flamework/core";
import { LOCAL_PLAYER } from "client/constants";
import { LEADERBOARDS } from "shared/constants";
import { getSound } from "shared/GameAssets";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";
import Sandbox from "shared/Sandbox";
import Packets from "shared/Packets";

Flamework.addPaths("src/client/controllers");
Flamework.ignite();

const jumpSound = getSound("Jump");
const onCharacterAdded = (character: Model) => {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    const hs = jumpSound.Clone();
    hs.Parent = humanoid.RootPart;
    humanoid.Jumping.Connect((active) => {
        if (active)
            hs.Play();
    });
};
if (LOCAL_PLAYER.Character)
    onCharacterAdded(LOCAL_PLAYER.Character);
LOCAL_PLAYER.CharacterAdded.Connect((character) => onCharacterAdded(character));

if (!Sandbox.getEnabled()) {
    const clickSound = getSound("Click").Clone();
    clickSound.Parent = LEADERBOARDS.Donated.DonationPart;
    for (const donationOption of LEADERBOARDS.Donated.DonationPart.SurfaceGui.Display.GetChildren()) {
        if (donationOption.IsA("TextButton")) {
            const amount = donationOption.LayoutOrder;
            let donationProduct = 0;
            for (const dp of DONATION_PRODUCTS) {
                if (dp.amount === amount) {
                    donationProduct = dp.id;
                }
            }
            donationOption.MouseButton1Click.Connect(() => {
                clickSound.Play();
                Packets.promptDonation.inform(donationProduct);
            });
        }
    }
}
