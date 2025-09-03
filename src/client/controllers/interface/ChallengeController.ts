/**
 * @fileoverviewrelated actions.
 *
 * Handles:
 * - Displaying and updating the current challenge window
 * - Managing challenge start/confirmation and leave actions
 * - Integrating with UI and quests controllers
 * - Observing challenge state and completion for live updates
 *
 * The controller manages challenge option buttons, confirmation logic, and reward display, coordinating with other controllers for UI and quest completion.
 *
 * @since 1.0.0
 */

import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { RunService } from "@rbxts/services";
import QuestsController from "client/controllers/interface/QuestsController";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import { getChallengeGui } from "shared/constants";
import Packets from "shared/Packets";
import { TRACKED_QUEST_WINDOW } from "./QuestsController";

declare global {
    type ChallengeGui = SurfaceGui & {
        ChallengeOptions: Frame;
        CurrentChallenge: Frame & {
            LeaveButton: TextButton;
            RequirementLabel: TextLabel;
            TitleLabel: TextLabel & {
                UIGradient: UIGradient;
            };
        };
    };
}

export const CHALLENGE_TASK_WINDOW = TRACKED_QUEST_WINDOW.WaitForChild("ChallengeTaskWindow") as Frame & {
    TitleLabel: TextLabel & {
        UIGradient: UIGradient;
    };
    RequirementLabel: TextLabel;
};

/**
 * Controller responsible for managing the challenge UI, challenge start/leave actions, and integration with UI and quests controllers.
 *
 * Handles challenge option setup, confirmation, and reward display.
 */
@Controller()
export default class ChallengeController implements OnPhysics, OnInit {
    /** Confirmation label text for challenge start. */
    confirmationLabel = "Are you sure?";
    /** Connection for the leave button. */
    leaveConnection?: RBXScriptConnection;
    /** The current challenge GUI instance. */
    challengeGui?: ChallengeGui;
    /** Debounce timer for leave action. */
    debounce = 0;

    constructor(private questsController: QuestsController) {}

    /**
     * Reloads and sets up challenge option buttons and leave button in the challenge GUI.
     * @param challengeGui The challenge GUI to reload.
     */
    reload(challengeGui: ChallengeGui) {
        challengeGui.ChallengeOptions.GetChildren().forEach((challengeOption) => {
            if (challengeOption.GetAttribute("loaded") === true || challengeOption.IsA("UIListLayout")) return;

            const startButton = (challengeOption as typeof ASSETS.ChallengeOption).StartButton;
            startButton.Activated.Connect(() => {
                playSound("MenuClick.mp3");
                const t = tick();
                if (t - ((startButton.GetAttribute("LastClick") as number) ?? 0) < 3) {
                    playSound("MagicCast.mp3");
                    Packets.startChallenge.toServer(challengeOption.Name);
                } else {
                    startButton.Label.Text = this.confirmationLabel;
                }
                startButton.SetAttribute("LastClick", t);
            });

            const connection = RunService.Heartbeat.Connect(() => {
                if (startButton === undefined || startButton.Parent === undefined) {
                    connection.Disconnect();
                    return;
                }
                const label = startButton.FindFirstChild("Label") as typeof startButton.Label;
                if (label === undefined) return;
                if (
                    label.Text === this.confirmationLabel &&
                    tick() - ((startButton.GetAttribute("LastClick") as number) ?? 0) > 3
                ) {
                    label.Text = "Start";
                }
            });
            challengeOption.SetAttribute("loaded", true);
        });

        const leaveButton = challengeGui.CurrentChallenge.LeaveButton;
        if (leaveButton.GetAttribute("Connected") !== true) {
            leaveButton.SetAttribute("Connected", true);
            leaveButton.Activated.Connect(() => {
                const t = tick();
                if (t - this.debounce < 1) return;
                this.debounce = t;

                playSound("MagicCast.mp3");
                Packets.quitChallenge.toServer();
            });
        }
    }

    /**
     * Called every physics frame; ensures the challenge GUI is loaded and reloaded as needed.
     */
    onPhysics() {
        const gui = this.challengeGui;
        if (gui !== undefined) {
            this.reload(gui);
        } else {
            this.challengeGui = getChallengeGui();
        }
    }

    /**
     * Initializes the ChallengeController, sets up observers for challenge state and completion.
     */
    onInit() {
        Packets.currentChallenge.observe((challengeInfo) => {
            if (challengeInfo.name === "") {
                CHALLENGE_TASK_WINDOW.Visible = false;
                return;
            }
            CHALLENGE_TASK_WINDOW.Visible = true;
            CHALLENGE_TASK_WINDOW.TitleLabel.Text = challengeInfo.name;
            const c1 = new Color3(challengeInfo.r1, challengeInfo.g1, challengeInfo.b1);
            const c2 = new Color3(challengeInfo.r2, challengeInfo.g2, challengeInfo.b2);
            CHALLENGE_TASK_WINDOW.TitleLabel.UIGradient.Color = new ColorSequence(c1, c2);
            CHALLENGE_TASK_WINDOW.RequirementLabel.Text = challengeInfo.description;
        });
        Packets.challengeCompleted.fromServer((challenge, rewardLabel) => {
            this.questsController.showCompletion(
                TRACKED_QUEST_WINDOW.ChallengeCompletion,
                `${challenge} rewards:\n${rewardLabel}`,
            );
        });
    }
}
