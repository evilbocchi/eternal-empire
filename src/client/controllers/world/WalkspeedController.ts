import { Controller } from "@flamework/core";
import { OnCharacterAdded } from "client/controllers/ModdingController";
import ChatHookController from "client/controllers/permissions/ChatHookController";

@Controller()
export default class WalkspeedController implements OnCharacterAdded {

    lastCustomWalkspeed = 16;
    private debounce = false;

    onCharacterAdded(character: Model) {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
        this.lastCustomWalkspeed = humanoid.WalkSpeed;
        rootPart.Touched.Connect((part) => {
            if (part.Name !== "ObbyZone" || this.debounce)
                return;
            this.debounce = true;
            this.lastCustomWalkspeed = humanoid.WalkSpeed;
            const newWs = 16;
            humanoid.WalkSpeed = newWs;
            this.chatHookController.showPersonalMessage(`You have entered an Obby. (Walkspeed = ${newWs})`);

            task.wait(0.1); // short debounce delay
            this.debounce = false;
        });
        rootPart.TouchEnded.Connect((part) => {
            if (part.Name !== "ObbyZone" || this.debounce)
                return;
            this.debounce = true;
            const newWs = this.lastCustomWalkspeed; // restore the last custom walkspeed
            humanoid.WalkSpeed = newWs;
            this.chatHookController.showPersonalMessage(`You have left the Obby. (Walkspeed = ${newWs})`);

            task.wait(0.1); // short debounce delay
            this.debounce = false;

        });
    }

    constructor(private chatHookController: ChatHookController) {

    }
}