import { Controller, OnInit, OnPhysics } from "@flamework/core";
import { RunService } from "@rbxts/services";
import QuestsController from "client/controllers/interface/QuestsController";
import UIController from "client/controllers/UIController";
import { getChallengeGui } from "shared/constants";
import { ASSETS } from "shared/GameAssets";
import Packets from "shared/Packets";
import { TRACKED_QUEST_WINDOW } from "./QuestsController";

declare global {
    type ChallengeGui = SurfaceGui & {
        ChallengeOptions: Frame,
        CurrentChallenge: Frame & {
            LeaveButton: TextButton,
            RequirementLabel: TextLabel,
            TitleLabel: TextLabel & {
                UIGradient: UIGradient;
            };
        };
    };
}

export const CHALLENGE_TASK_WINDOW = TRACKED_QUEST_WINDOW.WaitForChild("ChallengeTaskWindow") as Frame & {
    TitleLabel: TextLabel & {
        UIGradient: UIGradient;
    },
    RequirementLabel: TextLabel;
};

@Controller()
export default class ChallengeController implements OnPhysics, OnInit {

    confirmationLabel = "Are you sure?";
    leaveConnection?: RBXScriptConnection;
    challengeGui?: ChallengeGui;
    debounce = 0;

    constructor(private uiController: UIController, private questsController: QuestsController) {

    }

    reload(challengeGui: ChallengeGui) {
        challengeGui.ChallengeOptions.GetChildren().forEach((challengeOption) => {
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

        const leaveButton = challengeGui.CurrentChallenge.LeaveButton;
        if (leaveButton.GetAttribute("Connected") !== true) {
            leaveButton.SetAttribute("Connected", true);
            leaveButton.Activated.Connect(() => {
                const t = tick();
                if (t - this.debounce < 1)
                    return;
                this.debounce = t;

                this.uiController.playSound("MagicWoosh");
                Packets.quitChallenge.inform();
            });
        }
    }

    onPhysics() {
        const gui = this.challengeGui;
        if (gui !== undefined) {
            this.reload(gui);
        }
        else {
            this.challengeGui = getChallengeGui();
        }
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