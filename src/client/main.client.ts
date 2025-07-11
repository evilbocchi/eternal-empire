import { Dependency, Flamework } from "@flamework/core";
import { LOCAL_PLAYER } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { DONATION_PRODUCTS, LEADERBOARDS } from "shared/constants";
import { Fletchette } from "shared/utils/fletchette";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";

Flamework.addPaths("src/client/controllers");
Flamework.ignite();

const uiController = Dependency<UIController>();

task.spawn(() => {
    uiController.preloadAssets();
});

const onCharacterAdded = (character: Model) => {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    humanoid.Jumping.Connect((active) => {
        if (active)
            playSoundAtPart(humanoid.RootPart, uiController.getSound("Jump"));
    });
};
if (LOCAL_PLAYER.Character)
    onCharacterAdded(LOCAL_PLAYER.Character);
LOCAL_PLAYER.CharacterAdded.Connect((character) => onCharacterAdded(character));

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
            playSoundAtPart(LEADERBOARDS.Donated.DonationPart, uiController.getSound("Click"));
            Fletchette.getCanister("PermissionsCanister").promptDonation.fire(donationProduct);
        });
    }
}