import { Controller, OnStart } from "@flamework/core";
import { RunService } from "@rbxts/services";
import { DETAILS_WINDOW, LOCAL_PLAYER } from "client/constants";

@Controller()
export class DetailsController implements OnStart {

    onCharacterAdded(character: Model) {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        const rootPart = humanoid.RootPart;
        if (rootPart === undefined) {
            warn("What");
            return;
        }
        const connection = RunService.Heartbeat.Connect(() => {
            const pos = rootPart.Position;
            DETAILS_WINDOW.PositionLabel.Text = `Position: ${math.round(pos.X)}, ${math.round(pos.Y)}, ${math.round(pos.Z)}`;
        });
        humanoid.Died.Once(() => connection.Disconnect());
    }

    onStart() {
        if (LOCAL_PLAYER.Character !== undefined) {
            this.onCharacterAdded(LOCAL_PLAYER.Character);
        }
        LOCAL_PLAYER.CharacterAdded.Connect((model) => this.onCharacterAdded(model));

    }
}