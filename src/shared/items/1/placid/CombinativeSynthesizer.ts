import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import OmniUpgrader from "shared/item/traits/upgrader/OmniUpgrader";

export = new Item(script.Name)
    .setName("Combinative Synthesizer")
    .setDescription(
        "A minimalistic, deceptive upgrader. The boosts? Calculate them yourself, the lasers' colors represent the statistics that they boost. Get out that calculator!",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Skill", 2e12), 1)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands")
    .trait(OmniUpgrader)
    .setMuls(
        new Map([
            // Funds lasers
            ["0.5FundsLaser", new CurrencyBundle().set("Funds", 0.5)],
            ["0.75FundsLaser", new CurrencyBundle().set("Funds", 0.75)],
            ["1FundsLaser", new CurrencyBundle().set("Funds", 1)],
            ["1.25FundsLaser", new CurrencyBundle().set("Funds", 1.25)],
            ["1.5FundsLaser", new CurrencyBundle().set("Funds", 1.5)],
            ["1.75FundsLaser", new CurrencyBundle().set("Funds", 1.75)],
            // Bitcoin lasers
            ["0.5BitcoinLaser", new CurrencyBundle().set("Bitcoin", 0.5)],
            ["0.75BitcoinLaser", new CurrencyBundle().set("Bitcoin", 0.75)],
            ["1BitcoinLaser", new CurrencyBundle().set("Bitcoin", 1)],
            ["1.25BitcoinLaser", new CurrencyBundle().set("Bitcoin", 1.25)],
            ["1.75BitcoinLaser", new CurrencyBundle().set("Bitcoin", 1.75)],
            ["2.5BitcoinLaser", new CurrencyBundle().set("Bitcoin", 2.5)],
            // Power lasers
            ["0.25PowerLaser", new CurrencyBundle().set("Power", 0.25)],
            ["0.5PowerLaser", new CurrencyBundle().set("Power", 0.5)],
            ["0.75PowerLaser", new CurrencyBundle().set("Power", 0.75)],
            ["1PowerLaser", new CurrencyBundle().set("Power", 1)],
            ["1.25PowerLaser", new CurrencyBundle().set("Power", 1.25)],
            ["1.5PowerLaser", new CurrencyBundle().set("Power", 1.5)],
            ["1.75PowerLaser", new CurrencyBundle().set("Power", 1.75)],
            ["2.5PowerLaser", new CurrencyBundle().set("Power", 2.5)],
            ["2.75PowerLaser", new CurrencyBundle().set("Power", 2.75)],
            // Skill lasers
            ["0.25SkillLaser", new CurrencyBundle().set("Skill", 0.25)],
            ["0.5SkillLaser", new CurrencyBundle().set("Skill", 0.5)],
            ["0.75SkillLaser", new CurrencyBundle().set("Skill", 0.75)],
            ["1SkillLaser", new CurrencyBundle().set("Skill", 1)],
            ["1.25SkillLaser", new CurrencyBundle().set("Skill", 1.25)],
            ["1.5SkillLaser", new CurrencyBundle().set("Skill", 1.5)],
            ["1.75SkillLaser", new CurrencyBundle().set("Skill", 1.75)],
            ["2SkillLaser", new CurrencyBundle().set("Skill", 2)],
        ]),
    )

    .exit();
