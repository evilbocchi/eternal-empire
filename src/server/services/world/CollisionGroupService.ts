/**
 * @fileoverview Configures and manages Roblox physics collision groups.
 *
 * This service:
 * - Registers all required collision groups for the game world
 * - Sets up collision rules between groups for gameplay logic
 * - Ensures collision groups are initialized before any physics interactions
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { PhysicsService } from "@rbxts/services";
import { OnPlayerAdded } from "server/services/ModdingService";

/**
 * Service that sets up and manages collision groups and their interactions.
 */
@Service()
export default class CollisionGroupService implements OnInit, OnPlayerAdded {
    onPlayerAdded(player: Player) {
        const onCharacterAdded = (character: Model | undefined) => {
            if (character === undefined) return;
            const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
            for (const part of character.GetChildren()) {
                if (part.IsA("BasePart")) {
                    part.CollisionGroup = part === rootPart ? "PlayerHitbox" : "Player";
                }
            }
        };
        player.CharacterAdded.Connect((character) => onCharacterAdded(character));
        onCharacterAdded(player.Character);
    }

    /**
     * Initializes collision groups and configures their interactions.
     * Called automatically on service initialization.
     */
    onInit() {
        // Physics Collision Group Setup
        // Initialize all collision groups before any physics interactions occur

        PhysicsService.RegisterCollisionGroup("Decoration");
        PhysicsService.RegisterCollisionGroup("ItemHitbox");
        PhysicsService.RegisterCollisionGroup("Item");
        PhysicsService.RegisterCollisionGroup("BuildGrid");
        PhysicsService.RegisterCollisionGroup("QueryableGhost");
        PhysicsService.RegisterCollisionGroup("Antighost");
        PhysicsService.RegisterCollisionGroup("Droplet");
        PhysicsService.RegisterCollisionGroup("DropletInquirer");
        PhysicsService.RegisterCollisionGroup("Player");
        PhysicsService.RegisterCollisionGroup("PlayerHitbox");
        PhysicsService.RegisterCollisionGroup("PlayerInquirer");
        PhysicsService.RegisterCollisionGroup("NPC");

        // Configure collision interactions for droplets
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Default", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Droplet", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "QueryableGhost", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Decoration", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Item", true);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "BuildGrid", true);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "DropletInquirer", true);

        // Configure item hitbox interactions
        PhysicsService.CollisionGroupSetCollidable("ItemHitbox", "Droplet", false);
        PhysicsService.CollisionGroupSetCollidable("ItemHitbox", "Item", false);
        PhysicsService.CollisionGroupSetCollidable("ItemHitbox", "BuildGrid", false);

        // Configure special ghost groups for selective collision
        for (const group of PhysicsService.GetRegisteredCollisionGroups()) {
            PhysicsService.CollisionGroupSetCollidable("QueryableGhost", group.name, group.name === "QueryableGhost");
            PhysicsService.CollisionGroupSetCollidable("Antighost", group.name, group.name === "Droplet");
            PhysicsService.CollisionGroupSetCollidable(
                "NPC",
                group.name,
                group.name === "Default" || group.name === "BuildGrid",
            );
            PhysicsService.CollisionGroupSetCollidable("PlayerInquirer", group.name, group.name === "PlayerHitbox");
        }
    }
}
