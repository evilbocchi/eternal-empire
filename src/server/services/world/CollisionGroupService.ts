import { OnInit, Service } from "@flamework/core";
import { PhysicsService } from "@rbxts/services";

@Service()
export default class CollisionGroupService implements OnInit {
    onInit() {
        // Physics Collision Group Setup
        // Initialize all collision groups before any physics interactions occur

        PhysicsService.RegisterCollisionGroup("Decoration");
        PhysicsService.RegisterCollisionGroup("ItemHitbox");
        PhysicsService.RegisterCollisionGroup("Item");
        PhysicsService.RegisterCollisionGroup("QueryableGhost");
        PhysicsService.RegisterCollisionGroup("Antighost");
        PhysicsService.RegisterCollisionGroup("Droplet");
        PhysicsService.RegisterCollisionGroup("Player");
        PhysicsService.RegisterCollisionGroup("PlayerHitbox");
        PhysicsService.RegisterCollisionGroup("NPC");

        // Configure collision interactions for droplets
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Default", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Droplet", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "QueryableGhost", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Decoration", false);
        PhysicsService.CollisionGroupSetCollidable("Droplet", "Item", true);

        // Configure item hitbox interactions
        PhysicsService.CollisionGroupSetCollidable("ItemHitbox", "Droplet", false);
        PhysicsService.CollisionGroupSetCollidable("ItemHitbox", "Item", false);

        // Configure special ghost groups for selective collision
        for (const group of PhysicsService.GetRegisteredCollisionGroups()) {
            PhysicsService.CollisionGroupSetCollidable("QueryableGhost", group.name, group.name === "QueryableGhost");
            PhysicsService.CollisionGroupSetCollidable("Antighost", group.name, group.name === "Droplet");
            PhysicsService.CollisionGroupSetCollidable("NPC", group.name, group.name === "Default");
        }
    }
}