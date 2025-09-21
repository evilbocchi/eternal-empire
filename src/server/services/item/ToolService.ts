//!native
//!optimize 2

/**
 * @fileoverview Manages player tools, harvesting logic, and harvestable objects.
 *
 * This service provides:
 * - Assigning best tools to players and removing worse tools
 * - Handling tool usage and harvestable interactions
 * - Managing harvestable health, rewards, and respawn
 * - Initializing harvestable objects in all areas
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import { OnPlayerJoined } from "server/services/ModdingService";
import Gear from "shared/item/traits/Gear";
import Items from "shared/items/Items";

/**
 * Service that manages player tools and harvestable object interactions.
 */
@Service()
export class ToolService implements OnInit, OnPlayerJoined, OnPlayerJoined {
    /** Original position of each harvestable for respawn logic. */
    originalPosPerHarvestable = new Map<Instance, Vector3>();

    constructor(
        private itemService: ItemService,
        private dataService: DataService,
    ) {}

    /**
     * Refreshes the player's tools, giving best tools and removing worse ones.
     * @param player The player whose tools are refreshed.
     */
    refreshTools(player: Player) {
        const [tools, worse] = Gear.getBestGearsFromInventory(
            this.dataService.empireData.items.inventory,
            Items.itemsPerId,
        );
        if (tools.size() === 0 && worse.size() === 0) return;
        if (player.Character === undefined) return;
        const backpack = player.FindFirstChildOfClass("Backpack");
        if (backpack === undefined) return;
        for (const tool of tools) {
            const item = tool.item;
            const itemId = item.id;
            if (player.Character?.FindFirstChild(itemId) !== undefined || backpack.FindFirstChild(itemId) !== undefined)
                continue;
            const toolModel = item.MODEL?.Clone();
            if (toolModel !== undefined) {
                (toolModel as Tool).TextureId = item.image ?? "";
                toolModel.Parent = backpack;
            }
        }
        for (const tool of worse) {
            const itemId = tool.item.id;
            const holding = player.Character?.FindFirstChild(itemId);
            if (holding !== undefined) holding.Destroy();
            const inInv = backpack.FindFirstChild(itemId);
            if (inInv !== undefined) inInv.Destroy();
        }
    }

    /**
     * Handles player join events, refreshing tools and clearing backpack on death.
     * @param player The player who joined.
     */
    onPlayerJoined(player: Player) {
        player.CharacterAdded.Connect((character) => {
            (character.WaitForChild("Humanoid") as Humanoid).Died.Once(() => {
                player.FindFirstChildOfClass("Backpack")?.ClearAllChildren();
            });
            this.refreshTools(player);
        });
    }

    /**
     * Initializes the ToolService, sets up listeners and harvestable objects.
     */
    onInit() {
        this.itemService.itemsBought.connect((_player, items) => {
            for (const item of items) {
                if (item.isA("Gear")) {
                    for (const player of Players.GetPlayers()) this.refreshTools(player);
                    break;
                }
            }
        });
    }
}
