import Difficulty from "@rbxts/ejt";
import { getAsset } from "shared/asset/AssetMap";

namespace TierDifficulty {
    const image = getAsset("assets/MiscellaneousDifficulty.png");

    export const Tier1 = new Difficulty("Tier1")
        .setName("Tier 1")
        .setImage(image)
        .setColor(Color3.fromRGB(250, 163, 0))
        .setLayoutRating(1)
        .setClass(1);

    export const Tier2 = new Difficulty("Tier2")
        .setName("Tier 2")
        .setImage(image)
        .setColor(Color3.fromRGB(196, 204, 212))
        .setLayoutRating(2)
        .setClass(2);

    export const Tier3 = new Difficulty("Tier3")
        .setName("Tier 3")
        .setImage(image)
        .setColor(Color3.fromRGB(255, 237, 0))
        .setLayoutRating(3)
        .setClass(3);

    export const Tier4 = new Difficulty("Tier4")
        .setName("Tier 4")
        .setImage(image)
        .setColor(Color3.fromRGB(181, 245, 255))
        .setLayoutRating(4)
        .setClass(4);

    export const TIERS = new Set([Tier1, Tier2, Tier3, Tier4]);
}

export = TierDifficulty;
