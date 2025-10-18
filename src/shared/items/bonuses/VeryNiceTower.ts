import Difficulty from "@rbxts/ejt";
import { BadgeService, Players } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("30/30 rated tower 😱")
    .setDescription("you will not last 5 SECONDS in this tower")
    .setDifficulty(Difficulty.Bonuses)
    .setPrice(new CurrencyBundle().set("Funds", 10), 1)
    .addPlaceableArea("BarrenIslands")

    .onLoad((model) => {
        const touchPart = model.WaitForChild("TouchPart") as BasePart;
        touchPart.CanTouch = true;
        touchPart.Touched.Connect((other) => {
            const player = Players.GetPlayerFromCharacter(other.Parent);
            if (!player) return;
            try {
                BadgeService.AwardBadge(player.UserId, 1077478080869672); // TODO: change badge
            } catch {
                print("Failed to award badge");
            }
        });
    });
