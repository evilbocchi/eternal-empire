import Difficulty from "@antivivi/jjt-difficulties";
import { getAsset } from "shared/asset/AssetMap";

namespace TierDifficulty {
    const image = tonumber(getAsset("assets/MiscellaneousDifficulty.png").sub(14));
    if (image === undefined) {
        throw "Failed to load image for TierDifficulty";
    }

    export const Tier1 = new Difficulty()
        .setName("Tier 1")
        .setImage(image)
        .setColor(Color3.fromRGB(250, 163, 0))
        .setRating(1)
        .setClass(1);

    export const Tier2 = new Difficulty()
        .setName("Tier 2")
        .setImage(image)
        .setColor(Color3.fromRGB(196, 204, 212))
        .setRating(2)
        .setClass(2);

    export const Tier3 = new Difficulty()
        .setName("Tier 3")
        .setImage(image)
        .setColor(Color3.fromRGB(255, 237, 0))
        .setRating(3)
        .setClass(3);

    export const Tier4 = new Difficulty()
        .setName("Tier 4")
        .setImage(image)
        .setColor(Color3.fromRGB(181, 245, 255))
        .setRating(4)
        .setClass(4);
}

for (const [id, difficulty] of pairs(TierDifficulty)) {
    Difficulty.set(id, difficulty);
}

export = TierDifficulty;