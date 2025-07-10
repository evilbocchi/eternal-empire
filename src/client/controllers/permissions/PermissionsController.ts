/**
 * @fileoverview Client controller for managing permissions, commands, and donation/game modification events.
 *
 * Handles:
 * - Displaying and updating command list UI based on permission level
 * - Handling donation and code sharing events
 * - Integrating with UIController, EffectController, and AdaptiveTabController
 * - Responding to game modification packets for developer/admin actions
 *
 * The controller manages command UI, permission-based filtering, and feedback for donation and game modification events.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { TextChatService } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import AdaptiveTabController, { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/core/AdaptiveTabController";
import UIController from "client/controllers/core/UIController";
import EffectController from "client/controllers/world/EffectController";
import { ASSETS } from "shared/asset/GameAssets";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

declare global {
    type CommandOption = Frame & {
        AliasLabel: TextLabel,
        DescriptionLabel: TextLabel,
        PermLevelLabel: TextLabel;
    };

    interface Assets {
        CommandOption: CommandOption;
    }
}

export const SHARE_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Share") as Frame & {
    Code: Frame & {
        Input: TextBox;
    };
};

export const COMMANDS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Commands") as Frame & {
    CommandsList: ScrollingFrame & {

    };
};

/**
 * Controller responsible for managing permissions, command UI, and donation/game modification events.
 *
 * Handles command list display, permission filtering, and feedback for donation and code sharing.
 */
@Controller()
export default class PermissionsController implements OnInit {

    constructor(private uiController: UIController, private effectController: EffectController, private adaptiveTabController: AdaptiveTabController) {

    }

    /**
     * Initializes the PermissionsController, sets up listeners for donations, tab openings, and game modifications.
     */
    onInit() {
        Packets.donationGiven.connect(() => {
            this.uiController.playSound("PowerUp.mp3");
            this.effectController.camShake.Shake(CameraShaker.Presets.Bump);
        });
        Packets.tabOpened.connect((tab) => {
            this.adaptiveTabController.showAdaptiveTab(tab);
            if (tab === "Commands") {
                permLevelUpdated(LOCAL_PLAYER.GetAttribute("PermissionLevel") as number ?? 0);
            }
        });
        const permLevelUpdated = (permLevel: number) => {
            for (const c of COMMANDS_WINDOW.CommandsList.GetChildren()) {
                if (c.IsA("Frame")) {
                    c.Destroy();
                }
            }
            const commands = TextChatService.GetDescendants();
            for (const command of commands) {
                if (!command.IsA("TextChatCommand")) {
                    continue;
                }
                const pl = command.GetAttribute("PermissionLevel") as number ?? 0;
                const description = command.GetAttribute("Description") as string;
                if (description === undefined) {
                    continue;
                }
                if (pl > 3 && permLevel < 4) {
                    continue;
                }
                const option = ASSETS.CommandOption.Clone();
                option.Name = command.PrimaryAlias;
                option.AliasLabel.Text = command.PrimaryAlias;
                option.DescriptionLabel.Text = description;
                option.PermLevelLabel.Text = "Permission Level " + pl;
                option.BackgroundTransparency = pl > permLevel ? 0.5 : 0.8;
                option.LayoutOrder = pl;
                option.Parent = COMMANDS_WINDOW.CommandsList;
            }
        };
        Packets.codeReceived.connect((joinLink) => {
            SHARE_WINDOW.Code.Input.Text = joinLink;
            this.adaptiveTabController.showAdaptiveTab("Share");
        });

        Packets.modifyGame.connect((param) => {
            if (param === "markplaceableeverywhere") {
                Items.itemsPerId.forEach((item) => item.placeableEverywhere());
            }
        });
    }
}