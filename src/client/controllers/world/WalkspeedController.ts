/**
 * @fileoverview Client controller for managing player walkspeed changes in special zones.
 *
 * Handles:
 * - Adjusting player walkspeed when entering or leaving Obby zones
 * - Sending personal chat messages on walkspeed changes
 * - Integrating with ChatHookController for feedback
 *
 * The controller manages walkspeed transitions and feedback when the player interacts with Obby zones.
 *
 * @since 1.0.0
 */
import { Controller } from "@flamework/core";
import { Swimming } from "@rbxts/swimming";
import { OnCharacterAdded } from "client/controllers/core/ModdingController";
import ChatHookController from "client/controllers/permissions/ChatHookController";

/**
 * Controller responsible for managing player walkspeed changes in Obby zones and sending feedback messages.
 *
 * Handles walkspeed transitions and chat notifications on zone entry/exit.
 */
@Controller()
export default class WalkspeedController implements OnCharacterAdded {

    lastCustomWalkspeed = 16;
    idleSwimAnimation: Animation;
    actionSwimAnimation: Animation;
    swimHandler: Swimming;
    private debounce = false;

    /**
     * Handles character addition, sets up walkspeed logic for Obby zones.
     * @param character The player's character model.
     */
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
        this.idleSwimAnimation = new Instance("Animation");
        this.actionSwimAnimation = new Instance("Animation");
        this.idleSwimAnimation.AnimationId = "http://www.roblox.com/asset/?id=125750702";
        this.actionSwimAnimation.AnimationId = "http://www.roblox.com/asset/?id=180426354";
        this.swimHandler = new Swimming(7, "Water", this.idleSwimAnimation, this.actionSwimAnimation, 30);
    }
}