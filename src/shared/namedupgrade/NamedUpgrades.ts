import { OnoeNum } from "@antivivi/serikanum";
import NamedUpgrade, { FurnaceUpgrade, GainUpgrade, GeneratorUpgrade, GridSizeUpgrade, PurifierUpgrade, ResetUpgrade, WalkSpeedUpgrade } from "shared/namedupgrade/NamedUpgrade";
import CurrencyBundle from "shared/currency/CurrencyBundle";

namespace NamedUpgrades {
    const __1_25 = new OnoeNum(1.25);
    const __1_2 = new OnoeNum(1.2);
    const __1 = new OnoeNum(1);
    const __1_1 = new OnoeNum(1.1);
    const __1_05 = new OnoeNum(1.05);
    const __1_04 = new OnoeNum(1.04);
    const __1_03 = new OnoeNum(1.03);
    const __0_05 = new OnoeNum(0.05);

    const basicLevelUpgrades = (x: number) => __0_05.mul(x).add(__1);
    export const Stone = new FurnaceUpgrade()
        .setDescription("Boosts Funds processing value in all furnaces by 5%.")
        .setMul(x => new CurrencyBundle().set("Funds", basicLevelUpgrades(x)));

    export const WhiteGem = new GeneratorUpgrade()
        .setDescription("Boosts Power gain in all generators by 5%.")
        .setMul(x => new CurrencyBundle().set("Power", basicLevelUpgrades(x)));

    export const Crystal = new ResetUpgrade()
        .setDescription("Boosts Skill gain by 5%.")
        .setMul(x => new CurrencyBundle().set("Skill", basicLevelUpgrades(x)));

    export const MoreFunds = new GainUpgrade()
        .setName("Improved Droplet Technology")
        .setDescription("Increases Funds gain by 4% per upgrade compounding. Every 10 upgrades multiplies the upgrade by x1.2.")
        .setCap(100)
        .setImage(17567361523)
        .setPriceFormula((amount) => new CurrencyBundle().set("Funds", OnoeNum.fromSerika(1, 9).mul(new OnoeNum(1.55).pow(amount))))
        .setStepMul(10, (x) => new CurrencyBundle().set("Funds", __1_2.pow(x)))
        .setMul(x => new CurrencyBundle().set("Funds", __1_04.pow(x)));

    export const MorePower = new GainUpgrade()
        .setName("Better Networking")
        .setDescription("Increases Power gain by 3% per upgrade compounding. Every 10 upgrades multiplies the upgrade by x1.2.")
        .setCap(100)
        .setImage(17567361376)
        .setPriceFormula((amount) => new CurrencyBundle().set("Power", OnoeNum.fromSerika(4, 1).mul(new OnoeNum(1.45).pow(amount))))
        .setStepMul(10, (x) => new CurrencyBundle().set("Power", __1_2.pow(x)))
        .setMul(x => new CurrencyBundle().set("Power", __1_03.pow(x)));

    export const FasterTreading = new WalkSpeedUpgrade()
        .setName("Fast Treads")
        .setDescription("In case you hate walking, this upgrade increases player walkspeed by 1.")
        .setCap(4)
        .setImage(17567361098)
        .setPriceFormula((amount) => new CurrencyBundle().set("Power", OnoeNum.fromSerika(10, amount * 2)))
        .setFormula((y, x) => y + x);

    export const LandReclaimation = new GridSizeUpgrade("BarrenIslands")
        .setName("Land Reclaimation")
        .setDescription("Finally, some space. Increases the grid size of Barren Islands by 6 studs each side.")
        .setCap(5)
        .setImage(17567364321)
        .setPriceFormula((amount) => new CurrencyBundle().set("Funds", OnoeNum.fromSerika(5, 3 + (amount * 6))))
        .setFormula((y, x) => {
            const delta = x * 12;
            return y.add(new Vector3(delta, 0, delta));
        });

    export const CryptographicFunds = new GainUpgrade()
        .setName("Cryptographic Funds")
        .setDescription("Increases Funds gain by 5% per upgrade compounding. Every 10 upgrades multiplies the upgrade by x1.25.")
        .setCap(100)
        .setImage(17567394388)
        .setPriceFormula((amount) => new CurrencyBundle().set("Bitcoin", new OnoeNum(20).mul(new OnoeNum(1.75).pow(amount))))
        .setStepMul(10, (x) => new CurrencyBundle().set("Funds", __1_25.pow(x)))
        .setMul(x => new CurrencyBundle().set("Funds", __1_05.pow(x)));

    export const CryptographicPower = new GainUpgrade()
        .setName("Cryptographic Power")
        .setDescription("Increases Power gain by 4% per upgrade compounding. Every 10 upgrades multiplies the upgrade by x1.25.")
        .setCap(100)
        .setImage(17567405360)
        .setPriceFormula((amount) => new CurrencyBundle().set("Bitcoin", new OnoeNum(35).mul(new OnoeNum(1.75).pow(amount))))
        .setStepMul(10, (x) => new CurrencyBundle().set("Power", __1_25.pow(x)))
        .setMul(x => new CurrencyBundle().set("Power", __1_04.pow(x)));

    export const SkilledMining = new GainUpgrade()
        .setName("Skilled Mining")
        .setDescription("Increases Bitcoin gain by 10% per upgrade compounding. Every 10 upgrades multiplies the upgrade by x1.2.")
        .setCap(100)
        .setImage(17567487942)
        .setPriceFormula((amount) => new CurrencyBundle().set("Skill", new OnoeNum(2).mul(new OnoeNum(1.55).pow(amount))))
        .setStepMul(10, (x) => new CurrencyBundle().set("Bitcoin", __1_2.pow(x)))
        .setMul(x => new CurrencyBundle().set("Bitcoin", __1_1.pow(x)));

    export const LandReclaimationII = new GridSizeUpgrade("SlamoVillage")
        .setName("Land Reclaimation II")
        .setDescription("Increases the grid size of Slamo Village by 6 studs each side.")
        .setCap(5)
        .setImage(17705772522)
        .setPriceFormula((amount) => new CurrencyBundle().set("Skill", OnoeNum.fromSerika(5, (amount * 3) - 3)))
        .setFormula((y, x) => {
            const delta = x * 12;
            return y.add(new Vector3(delta, 0, delta));
        });

    export const ArtOfPurification = new PurifierUpgrade()
        .setName("Art of Purification")
        .setDescription("Increases Purifier Clicks gain by 240% per upgrade compounding.")
        .setCap(100)
        .setImage(109261040105304)
        .setPriceFormula((amount) => new CurrencyBundle().set("Funds", new OnoeNum(1e27).mul(new OnoeNum(4).pow(amount))))
        .setMul(x => new CurrencyBundle().set("Purifier Clicks", new OnoeNum(3.4).pow(x)));

    export const DarkerMatter = new GainUpgrade()
        .setName("Darker Matter")
        .setDescription("Increases Dark Matter gain by 220% per upgrade compounding.")
        .setCap(100)
        .setImage(124434412428696)
        .setPriceFormula((amount) => new CurrencyBundle().set("Power", new OnoeNum(1e15).mul(new OnoeNum(4).pow(amount))))
        .setMul(x => new CurrencyBundle().set("Dark Matter", new OnoeNum(3.2).pow(x)));

    export const SubsonicTreads = new WalkSpeedUpgrade()
        .setName("Subsonic Treads")
        .setDescription("Tired of walking. +2 walkspeed per upgrade.")
        .setCap(4)
        .setImage(108057575515003)
        .setPriceFormula((amount) => new CurrencyBundle().set("Bitcoin", OnoeNum.fromSerika(1, amount * 2 + 4)))
        .setFormula((y, x) => y + 2 * x);

    export const EfficientLearning = new GainUpgrade()
        .setName("Efficient Learning")
        .setDescription("Increases Skill gain by 5% per upgrade compounding.")
        .setCap(100)
        .setImage(76964690172344)
        .setPriceFormula((amount) => new CurrencyBundle().set("Skill", new OnoeNum(4).mul(new OnoeNum(4).pow(amount))))
        .setMul(x => new CurrencyBundle().set("Skill", new OnoeNum(1.05).pow(x)));

    export const GreedOfTheObbyI = new GainUpgrade()
        .setName("Greed of the Obby I")
        .setDescription("Increase the Funds gain of this upgrader by 10% per upgrade additively.")
        .setCap(10)
        .setImage(99168281301378)
        .setPriceFormula((amount) => new CurrencyBundle().set("Obby Points", new OnoeNum(1).mul(new OnoeNum(2).pow(amount))));

    export const PowerOfTheObbyI = new GainUpgrade()
        .setName("Power of the Obby I")
        .setDescription("Increase the Power gain of this upgrader by 10% per upgrade additively.")
        .setCap(10)
        .setImage(126029413609380)
        .setPriceFormula((amount) => new CurrencyBundle().set("Obby Points", new OnoeNum(2).mul(new OnoeNum(2).pow(amount))));

    export const DecentralityOfTheObbyI = new GainUpgrade()
        .setName("Decentrality of the Obby I")
        .setDescription("Increase the Bitcoin gain of this upgrader by 10% per upgrade additively.")
        .setCap(10)
        .setImage(86736020041508)
        .setPriceFormula((amount) => new CurrencyBundle().set("Obby Points", new OnoeNum(2).mul(new OnoeNum(2).pow(amount))));

    export const MasteryOfTheObbyI = new GainUpgrade()
        .setName("Mastery of the Obby I")
        .setDescription("Increase the Skill gain of this upgrader by 10% per upgrade additively.")
        .setCap(10)
        .setImage(116098981386646)
        .setPriceFormula((amount) => new CurrencyBundle().set("Obby Points", new OnoeNum(3).mul(new OnoeNum(2).pow(amount))));



    export const [UPGRADES_PER_TYPE, ALL_UPGRADES, register] = (function () {
        const upgrades = {
            Furnace: new Map<string, FurnaceUpgrade>(),
            Generator: new Map<string, GeneratorUpgrade>(),
            Purifier: new Map<string, PurifierUpgrade>(),
            Reset: new Map<string, ResetUpgrade>(),
            WalkSpeed: new Map<string, WalkSpeedUpgrade>(),
            GridSize: new Map<string, GridSizeUpgrade>(),
        };
        const all = new Map<string, NamedUpgrade>();
        function register(id: string, upgrade: NamedUpgrade) {
            upgrade.id = id;
            upgrade.types.forEach((t) => (upgrades as { [key: string]: Map<string, unknown>; })[t].set(id, upgrade));
            all.set(id, upgrade);
        }
        for (const [key, value] of pairs(NamedUpgrades)) {
            if (!(value instanceof NamedUpgrade))
                continue;
            register(key, value);
        }
        return [upgrades, all, register];
    })();

    export function getUpgrades<T extends keyof (typeof UPGRADES_PER_TYPE)>(upgradeType: T) {
        return UPGRADES_PER_TYPE[upgradeType] as typeof UPGRADES_PER_TYPE[T];
    }
}

export = NamedUpgrades;