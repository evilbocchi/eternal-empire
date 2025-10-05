import { OnInit, Service } from "@flamework/core";
import Difficulty from "@rbxts/ejt";
import { Players } from "@rbxts/services";
import eat from "shared/hamster/eat";
import getPlayerBackpack from "shared/hamster/getPlayerBackpack";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Packets from "shared/Packets";

const PREVIEW_TOOL_NAME = "BuildPreviewTool";

@Service()
export class BuildPreviewToolService implements OnInit {
    private readonly previewTools = new Map<Player, Tool>();
    private editModePreviewTool: Tool | undefined;
    private readonly activeDifficultyPerPlayer = new Map<Player, string>();
    private editModeActiveDifficulty: string | undefined;

    onInit() {
        eat(
            Packets.setBuildPreviewTool.fromClient((player, difficultyId) => this.handleRequest(player, difficultyId)),
            "Disconnect",
        );

        eat(
            Players.PlayerRemoving.Connect((player) => this.cleanupPlayer(player)),
            "Disconnect",
        );
    }

    private cleanupPlayer(player: Player) {
        this.removePreviewTool(player);
    }

    private handleRequest(player: Player | undefined, difficultyId: string) {
        if (difficultyId === "") {
            this.removePreviewTool(player);
            return;
        }

        if (
            (player !== undefined && this.activeDifficultyPerPlayer.get(player) === difficultyId) ||
            (player === undefined && this.editModeActiveDifficulty === difficultyId)
        ) {
            const tool = player ? this.previewTools.get(player) : this.editModePreviewTool;
            if (tool !== undefined && tool.Parent !== undefined) {
                this.ensureToolEquipped(player, tool, difficultyId);
                return;
            }
        }

        this.givePreviewTool(player, difficultyId);
    }

    private givePreviewTool(player: Player | undefined, difficultyId: string) {
        const color = this.getDifficultyColor(difficultyId);
        let tool = player ? this.previewTools.get(player) : this.editModePreviewTool;
        if (tool === undefined || !tool.IsDescendantOf(game)) {
            if (tool !== undefined) {
                tool.Destroy();
            }
            tool = this.createPreviewTool();
            if (player) {
                this.previewTools.set(player, tool);
            } else {
                this.editModePreviewTool = tool;
            }
        }

        this.configureTool(tool, difficultyId, color);
        this.placeTool(player, tool);
        if (player) {
            this.activeDifficultyPerPlayer.set(player, difficultyId);
        } else {
            this.editModeActiveDifficulty = difficultyId;
        }
    }

    private ensureToolEquipped(player: Player | undefined, tool: Tool, difficultyId: string) {
        const color = this.getDifficultyColor(difficultyId);
        this.configureTool(tool, difficultyId, color);
        this.placeTool(player, tool);
    }

    private createPreviewTool() {
        const tool = new Instance("Tool") as Tool;
        tool.Name = PREVIEW_TOOL_NAME;
        tool.CanBeDropped = false;
        tool.RequiresHandle = true;

        const handle = new Instance("Part");
        handle.Name = "Handle";
        handle.Size = new Vector3(1.5, 1.5, 1.5);
        handle.Material = Enum.Material.Neon;
        handle.CanCollide = false;
        handle.Anchored = false;
        handle.Massless = true;
        handle.Parent = tool;

        return tool;
    }

    private configureTool(tool: Tool, difficultyId: string, color: Color3) {
        tool.SetAttribute("BuildPreviewDifficulty", difficultyId);

        const handle = tool.FindFirstChild("Handle");
        if (handle !== undefined && handle.IsA("Part")) {
            handle.Color = color;
            handle.Material = Enum.Material.Neon;
            handle.Size = new Vector3(1.5, 1.5, 1.5);
            handle.CanCollide = false;
            handle.Anchored = false;
            handle.Massless = true;
            handle.Transparency = 0;
            handle.CastShadow = false;
            handle.Shape = Enum.PartType.Block;
        }
    }

    private placeTool(player: Player | undefined, tool: Tool) {
        const character = getPlayerCharacter(player);
        const humanoid = character?.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
        const backpack = getPlayerBackpack(player);

        if (character !== undefined && humanoid !== undefined) {
            tool.Parent = character;
            humanoid.EquipTool(tool);
        } else if (backpack !== undefined) {
            tool.Parent = backpack;
        }
    }

    private getDifficultyColor(difficultyId: string) {
        const difficulty = Difficulty.get(difficultyId);
        return difficulty?.color ?? Color3.fromRGB(255, 255, 255);
    }

    private removePreviewTool(player: Player | undefined) {
        const stored = player ? this.previewTools.get(player) : this.editModePreviewTool;
        if (stored !== undefined) {
            stored.Destroy();
            if (player) this.previewTools.delete(player);
        }
        if (player) this.activeDifficultyPerPlayer.delete(player);

        const character = getPlayerCharacter(player);
        if (character !== undefined) {
            const existing = character.FindFirstChild(PREVIEW_TOOL_NAME);
            if (existing !== undefined && existing.IsA("Tool")) {
                existing.Destroy();
            }
        }

        const backpack = getPlayerBackpack(player);
        if (backpack !== undefined) {
            const existing = backpack.FindFirstChild(PREVIEW_TOOL_NAME);
            if (existing !== undefined && existing.IsA("Tool")) {
                existing.Destroy();
            }
        }
    }
}
