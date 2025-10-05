import Difficulty from "@rbxts/ejt";
import { simpleInterval } from "@antivivi/vrldk";
import { Players } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Marketplace Terminal")
    .setDescription(
        "A high-tech terminal that provides access to the marketplace. Stand within 15 studs to automatically open the trading interface.",
    )
    .setDifficulty(Difficulty.Easy)
    .setPrice(new CurrencyBundle().set("Funds", 1000), 1)
    .addPlaceableArea("IntermittentIsles")
    .persists()
    .unbreakable()

    .onClientLoad((model) => {
        model.AddTag("MarketplaceTerminal");
        const modelPosition = model.GetPivot().Position;

        // Add visual effects on client side
        const primaryPart = model.PrimaryPart;
        if (!primaryPart) return;

        // Create a subtle glow effect
        const pointLight = new Instance("PointLight");
        pointLight.Color = Color3.fromRGB(99, 255, 138);
        pointLight.Brightness = 0.5;
        pointLight.Range = 10;
        pointLight.Parent = primaryPart;

        const screens = new Array<BasePart>();
        for (const part of model.GetChildren()) {
            if (part.IsA("BasePart") && part.Name === "Screen") {
                screens.push(part);
            }
        }

        const cleanup = simpleInterval(() => {
            let isPlayerNearby = false;
            for (const player of Players.GetPlayers()) {
                const character = getPlayerCharacter(player);
                if (character) {
                    const distance = character.GetPivot().Position.sub(modelPosition).Magnitude;
                    if (distance <= 15) {
                        isPlayerNearby = true;
                        break;
                    }
                }
            }

            for (const screen of screens) {
                if (isPlayerNearby) {
                    screen.Material = Enum.Material.Neon;
                    screen.Color = Color3.fromRGB(217, 255, 227);
                } else {
                    screen.Material = Enum.Material.Glass;
                    screen.Color = Color3.fromRGB(0, 0, 0);
                }
            }
        }, 1);

        model.Destroying.Once(cleanup);
    });
