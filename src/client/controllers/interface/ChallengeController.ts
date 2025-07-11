import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { RunService } from "@rbxts/services";
import { CHALLENGE_TASK_WINDOW, TRACKED_QUEST_WINDOW } from "client/constants";
import { QuestsController } from "client/controllers/interface/QuestsController";
import { UIController } from "client/controllers/UIController";
import { ASSETS, CHALLENGE_OPTIONS, CURRENT_CHALLENGE_WINDOW } from "shared/constants";
import Packets from "shared/network/Packets";

@Controller()
export class ChallengeController implements OnPhysics, OnInit {

    confirmationLabel = "Are you sure?";
    debounce = 0;

    constructor(private uiController: UIController, private questsController: QuestsController) {

    }

    onPhysics() {
        CHALLENGE_OPTIONS?.GetChildren().forEach((challengeOption) => {
            if (challengeOption.GetAttribute("loaded") === true || challengeOption.IsA("UIListLayout"))
                return;

            const startButton = (challengeOption as typeof ASSETS.ChallengeOption).StartButton;
            startButton.Activated.Connect(() => {
                this.uiController.playSound("Click");
                const t = tick();
                if (t - (startButton.GetAttribute("LastClick") as number ?? 0) < 3) {
                    this.uiController.playSound("MagicWoosh");
                    Packets.startChallenge.inform(challengeOption.Name);
                }
                else {
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
                if (label === undefined)
                    return;
                if (label.Text === this.confirmationLabel && tick() - (startButton.GetAttribute("LastClick") as number ?? 0) > 3) {
                    label.Text = "Start";
                }
            });
            challengeOption.SetAttribute("loaded", true);
        });

        CURRENT_CHALLENGE_WINDOW.LeaveButton.Activated.Connect(() => {
            const t = tick();
            if (t - this.debounce < 1)
                return;
            this.debounce = t;

            this.uiController.playSound("MagicWoosh");
            Packets.quitChallenge.inform();
        });
    }

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
        Packets.challengeCompleted.connect((challenge, rewardLabel) => {
            this.questsController.showCompletion(TRACKED_QUEST_WINDOW.ChallengeCompletion, `${challenge} rewards:\n${rewardLabel}`);
        });
    }
}