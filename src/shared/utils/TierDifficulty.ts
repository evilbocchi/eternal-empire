import Difficulty from "@antivivi/jjt-difficulties";

namespace TierDifficulty {
    export const Tier1 = new Difficulty()
    .setName("Tier 1")
    .setImage(17790114135)
    .setColor(Color3.fromRGB(250, 163, 0))
    .setRating(1)
    .setClass(1);

    export const Tier2 = new Difficulty()
    .setName("Tier 2")
    .setImage(17790114135)
    .setColor(Color3.fromRGB(196, 204, 212))
    .setRating(2)
    .setClass(2);

    export const Tier3 = new Difficulty()
    .setName("Tier 3")
    .setImage(17790114135)
    .setColor(Color3.fromRGB(255, 237, 0))
    .setRating(3)
    .setClass(3);

    export const Tier4 = new Difficulty()
    .setName("Tier 4")
    .setImage(17790114135)
    .setColor(Color3.fromRGB(181, 245, 255))
    .setRating(4)
    .setClass(4);
}

for (const [i, v] of pairs(TierDifficulty)) {
    (v as Difficulty).id = i;
    Difficulty.DIFFICULTIES.set(i, v as Difficulty);
}

export = TierDifficulty;