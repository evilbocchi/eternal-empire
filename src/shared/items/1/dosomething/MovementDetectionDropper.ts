import Difficulty from "@rbxts/ejt";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { getAllPlayerCharacters } from "shared/hamster/getPlayerCharacter";
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

        const lastPositions = new Map<Model, Vector3>();
        item.repeat(
            model,
            () => {
                let moving = false;

                for (const character of getAllPlayerCharacters()) {
                    if (!character) continue;

                    const position = character.GetPivot().Position;
                    if (modelPosition.sub(position).Magnitude > 50) continue;

                    const lastPosition = lastPositions.get(character);
                    // Check for significant movement (more than 2 studs)
                    if (!lastPosition || position.sub(lastPosition).Magnitude > 2) {
                        moving = true;
                        lastPositions.set(character, position);
                    }
                }

                for (const [character] of lastPositions) {
                    if (character === undefined || character.Parent === undefined) {
                        lastPositions.delete(character);
                        continue;
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
