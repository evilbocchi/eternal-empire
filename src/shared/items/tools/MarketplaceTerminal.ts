import Difficulty from "@antivivi/jjt-difficulties";
import { Players, RunService } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Packets from "shared/Packets";

export = new Item(script.Name)
    .setName("Marketplace Terminal")
    .setDescription("A high-tech terminal that provides access to the marketplace. Stand within 15 studs to automatically open the trading interface.")
    .setDifficulty(Difficulty.Easy)
    .setPrice(new CurrencyBundle().set("Funds", 1000), 1)
    .addPlaceableArea("IntermittentIsles")
    .persists()

    .onLoad((model, item) => {
        // Create detection region around the terminal
        const DETECTION_RANGE = 7.5; // 15x15 grid = 15 studs radius, so 7.5 from center to edge
        const detectionRegion = new Instance("Part");
        detectionRegion.Name = "DetectionRegion";
        detectionRegion.Size = new Vector3(15, 15, 15);
        detectionRegion.CFrame = model.GetPivot();
        detectionRegion.Anchored = true;
        detectionRegion.CanCollide = false;
        detectionRegion.CanTouch = true;
        detectionRegion.Transparency = 1;
        detectionRegion.Parent = model;

        // Track players and their state
        const playersInRange = new Set<Player>();
        const playersWithUIOpen = new Set<Player>();
        const playersBlockedFromReopening = new Set<Player>();

        // Handle player entering detection range
        detectionRegion.Touched.Connect((hit) => {
            const character = hit.Parent;
            if (!character || !character.IsA("Model")) return;

            const player = Players.GetPlayerFromCharacter(character);
            if (!player) return;

            const humanoid = character.FindFirstChildOfClass("Humanoid");
            if (!humanoid) return;

            // Check if player is already in range or blocked from reopening
            if (playersInRange.has(player) || playersBlockedFromReopening.has(player)) return;

            playersInRange.add(player);
            playersWithUIOpen.add(player);

            // Open marketplace UI
            Packets.openMarketplaceTerminal.fire(player);

            // Disable player movement
            humanoid.PlatformStand = true;
            humanoid.Sit = true;
        });

        // Monitor players continuously to detect when they leave the range
        const connection = RunService.Heartbeat.Connect(() => {
            for (const player of playersInRange) {
                if (!player.Character) {
                    playersInRange.delete(player);
                    playersWithUIOpen.delete(player);
                    continue;
                }

                const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
                const rootPart = humanoid?.RootPart;
                if (!rootPart) {
                    playersInRange.delete(player);
                    playersWithUIOpen.delete(player);
                    continue;
                }

                // Check if player is still within range
                const distance = rootPart.Position.sub(model.GetPrimaryPartCFrame().Position).Magnitude;
                if (distance > DETECTION_RANGE) {
                    playersInRange.delete(player);

                    // If player had UI open, close it and restore movement
                    if (playersWithUIOpen.has(player)) {
                        playersWithUIOpen.delete(player);
                        playersBlockedFromReopening.add(player);

                        // Close marketplace UI
                        Packets.closeMarketplaceTerminal.fire(player);

                        // Re-enable player movement
                        if (humanoid) {
                            humanoid.PlatformStand = false;
                            humanoid.Sit = false;
                        }

                        // Allow reopening after 2 seconds outside the range (using spawn to avoid blocking)
                        task.spawn(() => {
                            task.wait(2);
                            playersBlockedFromReopening.delete(player);
                        });
                    }
                }
            }
        });

        // Clean up when model is destroyed
        model.AncestryChanged.Connect(() => {
            if (!model.Parent) {
                connection.Disconnect();
            }
        });
    })

    .onClientLoad((model, item, player) => {
        // Add visual effects on client side
        const primaryPart = model.PrimaryPart;
        if (!primaryPart) return;

        // Create a subtle glow effect
        const pointLight = new Instance("PointLight");
        pointLight.Color = Color3.fromRGB(0, 150, 255);
        pointLight.Brightness = 0.5;
        pointLight.Range = 10;
        pointLight.Parent = primaryPart;

        // Add particle effect
        const attachment = new Instance("Attachment");
        attachment.Parent = primaryPart;

        const particles = new Instance("ParticleEmitter");
        particles.Color = new ColorSequence(Color3.fromRGB(0, 150, 255));
        particles.Size = new NumberSequence(0.2);
        particles.Lifetime = new NumberRange(1, 2);
        particles.Rate = 5;
        particles.SpreadAngle = new Vector2(45, 45);
        particles.Speed = new NumberRange(2, 4);
        particles.Parent = attachment;
    });