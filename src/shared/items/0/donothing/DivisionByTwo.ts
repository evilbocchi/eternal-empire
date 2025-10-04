import Difficulty from "@antivivi/jjt-difficulties";
import { setInstanceInfo } from "@antivivi/vrldk";
import { Players, Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { IS_EDIT } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_CATEGORIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { getAllPlayerCharacters, getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";

const rng = new Random();

export = new Item(script.Name)
    .setName("Division By Two")
    .setDescription(
        "Stand on the button and do absolutely nothing. Grants a bit of something per second while idle on the button.",
    )
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Bitcoin", 1000), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle())
    .beforeGain((_, generator) => {
        const all = Server.Currency.getOfflineRevenue();
        const main = new CurrencyBundle();
        for (const [currency, amount] of all.amountPerCurrency) {
            if (CURRENCY_DETAILS[currency].page === CURRENCY_CATEGORIES.Main) {
                main.set(currency, amount);
            }
        }

        const one = new CurrencyBundle();
        const index = rng.NextInteger(0, main.amountPerCurrency.size() - 1);
        let i = 0;
        for (const [currency, amount] of main.amountPerCurrency) {
            if (i === index) {
                one.set(currency, amount.div(2));
                break;
            }
            i++;
        }
        generator.setPassiveGain(one);
    })
    .exit()

    .onLoad((model, item) => {
        const button = model.WaitForChild("Button") as BasePart;
        const cframe = button.CFrame.add(new Vector3(0, 4.5, 0));
        const size = button.Size.add(new Vector3(0, 9, 0));
        const overlapParams = new OverlapParams();
        overlapParams.FilterType = Enum.RaycastFilterType.Include;

        const characterStillness = new Map<Model, { position: Vector3; timestamp: number }>();
        const REQUIRED_STILL_TIME = 2; // seconds
        const MOVEMENT_THRESHOLD = 0.5; // studs

        setInstanceInfo(model, "Maintained", false);
        item.repeat(
            model,
            () => {
                const characters = new Array<Model>();
                const filterDescendantsInstances = new Array<Instance>();
                for (const character of getAllPlayerCharacters()) {
                    filterDescendantsInstances.push(character);
                    characters.push(character);
                }

                overlapParams.FilterDescendantsInstances = filterDescendantsInstances;
                const parts = Workspace.GetPartBoundsInBox(cframe, size, overlapParams);

                let anyPlayerStillEnough = false;
                const currentTime = os.clock();

                // Check each player on the button
                for (const character of characters) {
                    const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

                    if (humanoidRootPart && parts.includes(humanoidRootPart)) {
                        const currentPosition = humanoidRootPart.Position;
                        const stillnessData = characterStillness.get(character);

                        if (stillnessData) {
                            const distance = currentPosition.sub(stillnessData.position).Magnitude;
                            if (distance < MOVEMENT_THRESHOLD) {
                                // Player is still, check if enough time has passed
                                if (currentTime - stillnessData.timestamp >= REQUIRED_STILL_TIME) {
                                    anyPlayerStillEnough = true;
                                }
                            } else {
                                // Player moved, reset their timer
                                characterStillness.set(character, {
                                    position: currentPosition,
                                    timestamp: currentTime,
                                });
                            }
                        } else {
                            // First time seeing this character on the button
                            characterStillness.set(character, { position: currentPosition, timestamp: currentTime });
                        }
                    } else {
                        // Character is not on the button, remove from tracking
                        characterStillness.delete(character);
                    }
                }

                setInstanceInfo(model, "Maintained", anyPlayerStillEnough);
            },
            0.5,
        );
    });
