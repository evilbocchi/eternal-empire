import Difficulty from "@antivivi/jjt-difficulties";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Players } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";

export = new Item(script.Name)
    .setName("Movement Detection Dropper")
    .setDescription("Drops %val% droplets every 2 seconds as long as you are moving near it.")
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Funds", 400), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("BeeBoun")

    .trait(Dropper)
    .setDroplet(Droplet.MovementDroplet)

    .exit()

    .onLoad((model, item) => {
        const modelPosition = model.GetPivot().Position;
        const dropInfo = getAllInstanceInfo(model.WaitForChild("Drop"));

        const lastPositions = new Map<Player, Vector3>();
        item.repeat(
            model,
            () => {
                const players = Players.GetPlayers();
                let moving = false;
                const playerSet = new Set<Player>();
                for (const player of players) {
                    playerSet.add(player);
                    const character = player.Character;
                    if (!character || !character.PrimaryPart) continue;

                    const position = character.PrimaryPart.Position;
                    if (modelPosition.sub(position).Magnitude > 50) {
                        // Player is too far away, skip movement detection
                        lastPositions.delete(player);
                        continue;
                    }

                    const lastPosition = lastPositions.get(player);

                    // Check if the player has moved significantly
                    if (!lastPosition || position.sub(lastPosition).Magnitude > 2) {
                        moving = true;
                        lastPositions.set(player, position);
                    }
                }
                for (const [player] of lastPositions) {
                    if (!playerSet.has(player)) {
                        lastPositions.delete(player);
                    }
                }

                dropInfo.DropRate = moving ? 0.5 : 0; // Set drop rate based on movement
                if (dropInfo.DropRate === 0) {
                    dropInfo.LastDrop = tick(); // Make them wait the full 2 seconds
                }
            },
            0.5,
        );
    });
