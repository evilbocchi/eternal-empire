import Difficulty from "@rbxts/ejt";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Players } from "@rbxts/services";
import { IS_EDIT } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { getPlayerCharacter } from "shared/hamster/getPlayerCharacter";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import Massless from "shared/item/traits/status/Massless";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "shared/items/1/Class1Shop";

const AntiGravityDropper = new Item(script.Name)
    .setName("Anti-Gravity Dropper")
    .setDescription(
        "A dropper that defies gravity - its droplets float upward! Drops %val% droplets every 2 seconds when players are jumping or airborne nearby. Manufactured in The Factory™.",
    )
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Funds", 450), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class1Shop)
    .setCreator("pog213123")

    .trait(Dropper)
    .setDroplet(Droplet.BalloonDroplet)

    .trait(Upgrader)
    .trait(Massless)
    .exit()

    .onLoad((model, item) => {
        const modelPosition = model.GetPivot().Position;
        const dropInfo = getAllInstanceInfo(model.WaitForChild("Drop"));

        item.repeat(
            model,
            () => {
                let isAirborne = false;

                if (IS_EDIT) {
                    // In edit mode, always allow the dropper to work
                    isAirborne = true;
                } else {
                    for (const player of Players.GetPlayers()) {
                        const character = getPlayerCharacter(player);
                        if (!character || !character.PrimaryPart) continue;

                        const position = character.PrimaryPart.Position;
                        const distance = modelPosition.sub(position).Magnitude;

                        // Check if player is within 50 studs
                        if (distance > 50) continue;

                        const humanoid = character.FindFirstChildOfClass("Humanoid");
                        if (!humanoid) continue;

                        // Check if player is jumping or in the air
                        const state = humanoid.GetState();

                        if (
                            state === Enum.HumanoidStateType.Freefall ||
                            state === Enum.HumanoidStateType.Flying ||
                            state === Enum.HumanoidStateType.Jumping
                        ) {
                            isAirborne = true;
                        }
                    }
                }

                dropInfo.dropRate = isAirborne ? 0.5 : 0; // 0.5 = every 2 seconds
                if (dropInfo.dropRate === 0) {
                    dropInfo.lastDrop = tick(); // Reset timer when no one is airborne
                }
            },
            0.5,
        );
    });

const massless = AntiGravityDropper.trait(Massless);
AntiGravityDropper.trait(Dropper).onDropletProduced((droplet) => massless.decorate(droplet));

export = AntiGravityDropper;
