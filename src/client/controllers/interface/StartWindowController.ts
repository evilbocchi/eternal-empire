import { Controller, OnInit } from "@flamework/core";
import { Players, RunService, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER, START_WINDOW } from "client/constants";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { BalanceWindowController } from "client/controllers/interface/BalanceWindowController";
import { LoadingWindowController } from "client/controllers/interface/LoadingWindowController";
import { EmpireInfo, START_CAMERA, START_SCREEN_ENABLED, UI_ASSETS, getNameFromUserId } from "shared/constants";
import { Fletchette } from "shared/utils/fletchette";
import computeNameColor from "shared/utils/vrldk/ComputeNameColor";
import { convertToHHMMSS } from "shared/utils/vrldk/NumberAbbreviations";
import { getHumanoid } from "shared/utils/vrldk/PlayerUtils";
import { paintObjects } from "shared/utils/vrldk/UIUtils";

const EmpireCanister = Fletchette.getCanister("EmpireCanister");

@Controller()
export class StartWindowController implements OnInit {
    constructor(private uiController: UIController, private adaptiveTabController: AdaptiveTabController, private balanceWindowController: BalanceWindowController, 
        private loadingWindowController: LoadingWindowController) {
    }

    hideStartWindow() {
        this.loadingWindowController.showLoadingWindow("Loading stuff");
        task.delay(1, () => {
            START_WINDOW.Visible = false;
            if (Workspace.CurrentCamera !== undefined) {
                Workspace.CurrentCamera.CameraType = Enum.CameraType.Custom;
                Workspace.CurrentCamera.CameraSubject = getHumanoid(LOCAL_PLAYER);
            }
            this.balanceWindowController.showBalanceWindow();
            this.adaptiveTabController.showSidebarButtons();
            this.loadingWindowController.refreshLoadingWindow("Done loading");
            this.loadingWindowController.hideLoadingWindow();
        });
    }
    
    showStartWindow() {
        if (Workspace.GetAttribute("IsPublicServer") !== true || Workspace.GetAttribute("IsSingleServer") === true) {
            return;
        }
        if (RunService.IsStudio() && START_SCREEN_ENABLED === false) {
            return;
        }
        this.balanceWindowController.hideBalanceWindow();
        this.adaptiveTabController.hideSidebarButtons();
        if (Workspace.CurrentCamera !== undefined) {
            Workspace.CurrentCamera.CameraType = Enum.CameraType.Scriptable;
            Workspace.CurrentCamera.CFrame = START_CAMERA.CFrame;
        }
        START_WINDOW.EmpiresWindow.Position = new UDim2(0.5, 0, 1.4, 0);
        START_WINDOW.Header.Position = new UDim2(0, 0, -0.4, 0);
        START_WINDOW.Footer.Position = new UDim2(0, 0, 1.4, 0);
        START_WINDOW.Header.Logo.Position = new UDim2(0.5, 0, -1.1, 0);
        START_WINDOW.Header.Logo.Rotation = math.random() >= 0.5 ? 50 : -50;
        TweenService.Create(START_WINDOW.Header, new TweenInfo(1), {Position: new UDim2(0, 0, 0, 0)}).Play();
        TweenService.Create(START_WINDOW.Footer, new TweenInfo(1), {Position: new UDim2(0, 0, 1, 0)}).Play();
        TweenService.Create(START_WINDOW.Header.Logo, new TweenInfo(1.4), {Position: new UDim2(0.5, 0, -0.1, 0), Rotation: 0}).Play();
        task.delay(1.4, () => {
            TweenService.Create(START_WINDOW.EmpiresWindow, new TweenInfo(1), {Position: new UDim2(0.5, 0, 0.65, 0)}).Play();
        });
        START_WINDOW.Visible = true;
    }

    refreshEmpiresWindow(availableEmpires?: Map<string, EmpireInfo>) {
        if (availableEmpires === undefined) {
            this.refreshEmpiresWindow(EmpireCanister.availableEmpires.get() ?? new Map<string, EmpireInfo>());
            return;
        }
        for (const [availableEmpire, empireInfo] of availableEmpires) {
            if (START_WINDOW.EmpiresWindow.EmpireOptions.FindFirstChild(availableEmpire) !== undefined) {
                continue;
            }
            const empireOption = UI_ASSETS.EmpiresWindow.EmpireOption.Clone();
            empireOption.Activated.Connect(() => {
                this.uiController.playSound("Click");
                this.loadingWindowController.showLoadingWindow("Loading server");
                EmpireCanister.teleportToEmpire.fire(availableEmpire);
            });
            empireOption.Name = availableEmpire;
            empireOption.EmpireIDLabel.Text = availableEmpire;
            empireOption.EmpireInformation.Labels.TitleLabel.Text = empireInfo.name ?? "error";
            empireOption.EmpireInformation.Labels.OwnerLabel.Text = empireInfo.owner ? "Owned by " + getNameFromUserId(empireInfo.owner) : "could not load info";
            empireOption.Stats.ItemsLabel.Text = "Items: " + empireInfo.items;
            empireOption.Stats.DateCreatedLabel.Text = "Created: " + os.date("%x", empireInfo.created);
            empireOption.Stats.PlaytimeLabel.Text = "Playtime: " + convertToHHMMSS(empireInfo.playtime ?? 0);
            const color = (empireInfo.name ? computeNameColor(empireInfo.name) : Color3.fromRGB(0, 170, 0)) ?? Color3.fromRGB(0, 170, 0);
            empireOption.BackgroundColor3 = color;
            empireOption.UIStroke.Color = color;
            paintObjects(empireOption, color);
            empireOption.Parent = START_WINDOW.EmpiresWindow.EmpireOptions;
            task.spawn(() => {
                if (empireOption === undefined || empireOption.FindFirstChild("EmpireInformation") === undefined) {
                    return;
                }
                empireOption.EmpireInformation.OwnerAvatar.Image = empireInfo.owner ? 
                    Players.GetUserThumbnailAsync(empireInfo.owner, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size150x150)[0] : "";
            });
        }
    }

    onInit() {
        const newEmpireOption = UI_ASSETS.EmpiresWindow.NewEmpireOption.Clone();
        const ogText = newEmpireOption.MessageLabel.Text;
        newEmpireOption.Activated.Connect(() => {
            this.uiController.playSound("Click");
            newEmpireOption.MessageLabel.Text = "Creating empire...";
            const success = EmpireCanister.createNewEmpire.invoke();
            if (!success) {
                newEmpireOption.MessageLabel.Text = "Only 1 empire for now.";
                task.delay(2, () => newEmpireOption.MessageLabel.Text = ogText);
            }
            else {
                newEmpireOption.MessageLabel.Text = ogText;
            }
        });
        newEmpireOption.Parent = START_WINDOW.EmpiresWindow.EmpireOptions;

        this.refreshEmpiresWindow();

        START_WINDOW.EmpiresWindow.PublicEmpireWindow.JoinPublicEmpire.Activated.Connect(() => {
            this.uiController.playSound("Click");
            this.hideStartWindow();
        });

        EmpireCanister.availableEmpires.observe((availableEmpires) => this.refreshEmpiresWindow(availableEmpires));
        this.showStartWindow();
    }
}