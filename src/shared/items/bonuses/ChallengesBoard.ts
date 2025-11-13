import Difficulty from "@rbxts/ejt";
import { Server } from "shared/api/APIExpose";
import ThisEmpire from "shared/data/ThisEmpire";
import Item from "shared/item/Item";
import Sandbox from "shared/Sandbox";

export = new Item(script.Name)
    .setName("Challenges Board")
    .setDescription("A board that offers various challenges to complete.")
    .setDifficulty(Difficulty.Bonuses)
    .placeableEverywhere()
    .onLoad((model) => {
        if (Sandbox.getEnabled()) {
            const questMetadata = ThisEmpire.data.questMetadata;

            questMetadata.set("ChallengesUnlocked", true);
            Server.Challenge.refreshChallenges();

            model.Destroying.Connect(() => {
                questMetadata.set("ChallengesUnlocked", false);
            });
        }
    })
    .onSharedLoad((model) => {
        model.WaitForChild("ChallengesBoard").AddTag("ChallengesBoard");
    });
