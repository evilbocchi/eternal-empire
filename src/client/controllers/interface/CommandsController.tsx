/**
 * @fileoverview Client controller for managing the React-based commands window.
 *
 * Handles:
 * - Creating and managing the React root for commands UI
 * - Responding to tab opened events for commands
 * - Managing commands window visibility and state
 * - Integrating with permission system updates
 *
 * The controller provides a React-based commands window that replaces the old adaptive tab implementation.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { PLAYER_GUI } from "client/constants";
import { playSound } from "shared/asset/GameAssets";
import { LOCAL_PLAYER } from "shared/constants";
import Packets from "shared/Packets";
import BasicWindow from "client/ui/components/window/BasicWindow";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";
import { getAsset } from "shared/asset/AssetMap";

const COMMANDS_GUI = new Instance("ScreenGui");
COMMANDS_GUI.IgnoreGuiInset = true;
COMMANDS_GUI.ResetOnSpawn = false;
COMMANDS_GUI.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
COMMANDS_GUI.Name = "CommandsWindow";
COMMANDS_GUI.Parent = PLAYER_GUI;

/**
 * Controller responsible for managing the React-based commands window.
 *
 * Handles commands UI display, permission filtering, and integration with tab system.
 */
@Controller()
export default class CommandsController implements OnInit {
    private commandsRoot?: ReactRoblox.Root;
    private isCommandsWindowVisible = false;
    private userPermissionLevel = 0;

    /**
     * Shows the commands window.
     */
    showCommandsWindow() {
        if (this.isCommandsWindowVisible) return;

        this.isCommandsWindowVisible = true;
        playSound("MenuOpen.mp3");
        this.renderCommandsWindow();
    }

    /**
     * Hides the commands window.
     */
    hideCommandsWindow() {
        if (!this.isCommandsWindowVisible) return;

        this.isCommandsWindowVisible = false;
        playSound("MenuClose.mp3");
        this.renderCommandsWindow();
    }

    /**
     * Toggles the commands window visibility.
     * @returns True if the window was shown, false if hidden.
     */
    toggleCommandsWindow(): boolean {
        if (this.isCommandsWindowVisible) {
            this.hideCommandsWindow();
            return false;
        } else {
            this.showCommandsWindow();
            return true;
        }
    }

    /**
     * Renders the commands window with current state.
     */
    private renderCommandsWindow() {
        if (!this.commandsRoot) {
            this.commandsRoot = ReactRoblox.createRoot(COMMANDS_GUI);
        }

        const colorSequence = new ColorSequence([
            new ColorSequenceKeypoint(0, Color3.fromRGB(100, 150, 255)),
            new ColorSequenceKeypoint(1, Color3.fromRGB(50, 100, 200)),
        ]);

        this.commandsRoot.render(
            <BasicWindow
                visible={this.isCommandsWindowVisible}
                icon={getAsset("assets/Settings.png")}
                title="Commands"
                colorSequence={colorSequence}
                onClose={() => this.hideCommandsWindow()}
                windowId="commands"
                priority={1}
            >
                <CommandsWindow visible={this.isCommandsWindowVisible} userPermissionLevel={this.userPermissionLevel} />
            </BasicWindow>,
        );
    }

    /**
     * Updates the user's permission level and re-renders if needed.
     * @param permissionLevel The new permission level.
     */
    updatePermissionLevel(permissionLevel: number) {
        this.userPermissionLevel = permissionLevel;
        if (this.isCommandsWindowVisible) {
            this.renderCommandsWindow();
        }
    }

    /**
     * Initializes the CommandsController, sets up packet listeners and permission tracking.
     */
    onInit() {
        // Listen for tab opened events
        Packets.tabOpened.fromServer((tab) => {
            if (tab === "Commands") {
                this.showCommandsWindow();
            }
        });

        // Track permission level changes
        LOCAL_PLAYER.GetAttributeChangedSignal("PermissionLevel").Connect(() => {
            const permissionLevel = (LOCAL_PLAYER.GetAttribute("PermissionLevel") as number) ?? 0;
            this.updatePermissionLevel(permissionLevel);
        });

        // Set initial permission level
        const initialPermissionLevel = (LOCAL_PLAYER.GetAttribute("PermissionLevel") as number) ?? 0;
        this.updatePermissionLevel(initialPermissionLevel);

        // Create initial (hidden) render
        this.renderCommandsWindow();
    }
}
