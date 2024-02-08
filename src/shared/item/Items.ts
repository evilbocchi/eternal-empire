import { RunService, TweenService } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Conveyor from "shared/item/Conveyor";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Furnace from "shared/item/Furnace";
import Item from "shared/item/Item";
import Shop from "shared/item/Shop";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect, weldModel } from "shared/utils/vrldk/BasePartUtils";
import Charger from "./Charger";
import Generator from "./Generator";
import InstantiationDelimiter from "./InstantiationDelimiter";
import Transformer from "./Transformer";

class Items {
    static ITEMS: Item[] = [];

    static TheFirstDropper = Items.registerItem(
        new Dropper("TheFirstDropper")
        .setName("The First Dropper")
        .setDescription("Produces droplets. Place this dropper above a furnace to start earning some Funds.")
        .setDifficulty(Difficulties.TheFirstDifficulty)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(0)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(10)), 2)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(55)), 3)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setDroplet(Droplet.TheFirstDroplet)
        .setDropRate(1)
    );

    static TheFirstFurnace = Items.registerItem(
        new Furnace("TheFirstFurnace")
        .setName("The First Furnace")
        .setDescription("Processes droplets, turning them into liquid currency.")
        .setDifficulty(Difficulties.TheFirstDifficulty)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(0)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setProcessValue(new Price().setCost("Funds", new InfiniteMath(1)))
    );

    static TheFirstConveyor = Items.registerItem(
        new Conveyor("TheFirstConveyor")
        .setName("The First Conveyor")
        .setDescription("Moves stuff from one place to another. Use this to push droplets into furnaces.")
        .setDifficulty(Difficulties.TheFirstDifficulty)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(5)), 1, 5)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setSpeed(6)
    );

    static TheFirstUpgrader = Items.registerItem(
        new Upgrader("TheFirstUpgrader")
        .setName("The First Upgrader")
        .setDescription("Increases the monetary value of droplets. Pass droplets through the laser to increase revenue.")
        .setDifficulty(Difficulties.TheFirstDifficulty)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(30)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setSpeed(3)
        .setAdd(new Price().setCost("Funds", new InfiniteMath(4)))
    );

    static BulkyDropper = Items.registerItem(
        new Dropper("BulkyDropper")
        .setName("Bulky Dropper")
        .setDescription("Takes a lot of space, but generates $4/droplet/s.")
        .setDifficulty(Difficulties.TheLowerGap)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(100)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(545)), 2)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(1450)), 2)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setDroplet(Droplet.FatDroplet)
        .setDropRate(1)
    );

    static ImprovedFurnace = Items.registerItem(
        new Furnace("ImprovedFurnace")
        .setName("Improved Furnace")
        .setDescription("An upgraded version of The First Furnace. Processes droplets for $2x more value.")
        .setDifficulty(Difficulties.TheLowerGap)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(245)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setProcessValue(new Price().setCost("Funds", new InfiniteMath(2)))
    );
    
    static BasicRefiner = Items.registerItem(
        new Upgrader("BasicRefiner")
        .setName("Basic Refiner")
        .setDescription("A flag-like device used to refine droplets, increasing their value by $10.")
        .setDifficulty(Difficulties.TheLowerGap)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(1000)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(3600)), 2)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setAdd(new Price().setCost("Funds", new InfiniteMath(10)))
    );

    static ExtendedConveyor = Items.registerItem(
        new Conveyor("ExtendedConveyor")
        .setName("Extended Conveyor")
        .setDescription("More conveyors for your conveying needs! Takes a bit more space though, and unable to change directions.")
        .setDifficulty(Difficulties.TheLowerGap)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(65)), 1, 10)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setSpeed(5)
    );

    static BasicCauldron = Items.registerItem(
        new Furnace("BasicCauldron")
        .setName("Basic Cauldron")
        .setDescription("Able to process droplets for 25x more funds, but must be directly dropped into.")
        .setDifficulty(Difficulties.TheLowerGap)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(5000)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setProcessValue(new Price().setCost("Funds", new InfiniteMath(25)))
    );

    static ConveyorCorner = Items.registerItem(
        new Conveyor("ConveyorCorner")
        .setName("Conveyor Corner")
        .setDescription("A conveyor invented by Move-Your-Droplets™. Advertised to 'rotate any droplet, anytime.' Only goes clockwise unfortunately.")
        .setDifficulty(Difficulties.TheLowerGap)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(90)), 1, 5)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setSpeed(5)
    );

    static HandCrankDropper = Items.registerItem(
        new Dropper("HandCrankDropper")
        .setName("Hand Crank Dropper")
        .setDescription("Manual labour at its finest! Click the hand crank to increase drop rate to 3x. Produces $15/droplet/s in its normal state.")
        .setDifficulty(Difficulties.Negativity)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(5500)), 1, 2)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(7000)), 3)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setDroplet(Droplet.ManualDroplet)
        .setDropRate(1)
        .onLoad((model, _utils) => {
            let t = 0;
            const crank = model.WaitForChild("Crank") as Model;
            const v = new Instance("IntValue");
            const bp = weldModel(crank);
            const o = bp.CFrame;
            v.Value = 0;
            v.Parent = crank;
            const drop = model.WaitForChild("Drop");
            const c1 = RunService.Heartbeat.Connect(() => {
                bp.CFrame = o.mul(CFrame.Angles(0, 0, math.rad(v.Value)));
                drop.SetAttribute("DropRate", tick() - t < 5 ? 3 : 1);
            });
            const sound = crank.FindFirstChildOfClass("Sound");
            const pp = bp.FindFirstChildOfClass("ProximityPrompt");
            if (pp === undefined || sound === undefined)
                return;
            let tween: Tween | undefined = undefined;
            pp.Triggered.Connect(() => {
                if (tick() - t > 1) {
                    t = tick();
                    sound.Play();
                    if (tween === undefined || tween.PlaybackState === Enum.PlaybackState.Completed) {
                        v.Value = 0;
                        tween = TweenService.Create(v, new TweenInfo(1), {Value: 360});
                        tween.Play();
                    }
                }
            });
            model.Destroying.Once(() => c1.Disconnect());
        })
    );

    static DropletSlayerMkI = Items.registerItem(
        new Upgrader("DropletSlayerMkI")
        .setName("Droplet Slayer Mk. I")
        .setDescription("What in the... Fires a short beam that multiplies a droplet's value by $3x every 4 seconds.")
        .setDifficulty(Difficulties.Negativity)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(6600)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setMul(new Price().setCost("Funds", new InfiniteMath(3)))
        .onLoad((model, _utils, item) => {
            const laser = model.WaitForChild("Laser") as BasePart;
            const sound = laser.WaitForChild("Sound") as Sound;
            const oCFrame = laser.CFrame;
            const bye = oCFrame.sub(new Vector3(0, 10000, 0));
            laser.CFrame = bye;
            item.repeat(model, () => {
                sound.Play();
                laser.CFrame = oCFrame;
                laser.Transparency = 0.3;
                TweenService.Create(laser, new TweenInfo(0.5), {Transparency: 1}).Play();
                task.delay(0.5, () => {
                    laser.CFrame = bye;
                });
            }, 4);
        })
    );

    static HeavyweightDropper = Items.registerItem(
        new Dropper("HeavyweightDropper")
        .setName("Heavy-weight Dropper")
        .setDescription("Despite the name, its build is actually quite modest. Produces $110/droplet/2s.")
        .setDifficulty(Difficulties.Negativity)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(9000)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(14000)), 2)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setDroplet(Droplet.HeavyweightDroplet)
        .setDropRate(0.5)
    );

    static DirectDropletWasher = Items.registerItem(
        new Upgrader("DirectDropletWasher")
        .setName("Direct Droplet Washer")
        .setDescription("Upgrades droplets dropped directly above it for a $55 gain.")
        .setDifficulty(Difficulties.Negativity)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(25000)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(30000)), 2)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(40000)), 3)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(60000)), 4)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(100000)), 5, 9)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(200000)), 10, 20)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setAdd(new Price().setCost("Funds", new InfiniteMath(55)))
    );

    static InstantiationDelimiterI = Items.registerItem(
        new InstantiationDelimiter("InstantiationDelimiterI")
        .setName("Instantiation Delimiter I")
        .setDescription("Increases droplet limit by 25, but uses $15/s.")
        .setDifficulty(Difficulties.Negativity)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(100000)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setDropletIncrease(25)
        .setMaintenance(new Price().setCost("Funds", new InfiniteMath(15)))
    );

    static LaserFan = Items.registerItem(
        new Upgrader("LaserFan")
        .setName("Laser Fan")
        .setDescription("If you've played tower defense games, you know exactly how to utilise this. Increases droplet value by $1.3x compounding per blade.")
        .setDifficulty(Difficulties.Unimpossible)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(150000)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(350000)), 2)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setMul(new Price().setCost("Funds", new InfiniteMath(1.3)))
        .onLoad((model, _utils, item) => {
            const motor = model.WaitForChild("Motor") as Model;
            const bp = weldModel(motor);
            const o = bp.CFrame;
            let v = 0;
            let d = 3;
            const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear);
            item.repeat(model, () => {
                v += d;
                TweenService.Create(bp, tweenInfo, {CFrame: o.mul(CFrame.Angles(math.rad(v), 0, 0))}).Play();
            }, 0.1);
            (bp.WaitForChild("ProximityPrompt") as ProximityPrompt).Triggered.Connect(() => d = -d);
        })
    );

    static VolatileCauldron = Items.registerItem(
        new Furnace("VolatileCauldron")
        .setName("Volatile Cauldron")
        .setDescription("A cauldron giving... some multiplier of Funds? I don't know.")
        .setDifficulty(Difficulties.Unimpossible)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(700000)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)
        
        .setProcessValue(new Price().setCost("Funds", new InfiniteMath(225)))
        .setVariance(0.4)
    );

    static ButtonFurnace = Items.registerItem(
        new Furnace("ButtonFurnace")
        .setName("Button Furnace")
        .setDescription("Doesn't actually press. Gives a sizeable $70x bonus though!")
        .setDifficulty(Difficulties.Unimpossible)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(700000)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)
        
        .setProcessValue(new Price().setCost("Funds", new InfiniteMath(70)))
    );

    static SmallReactor = Items.registerItem(
        new Upgrader("SmallReactor")
        .setName("Small Reactor")
        .setDescription("Small? THAT is small? Well, this 'small' reactor gives a $3.5x boost to any droplets passing through it.")
        .setDifficulty(Difficulties.Unimpossible)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(3500000)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setSpeed(5)
        .setMul(new Price().setCost("Funds", new InfiniteMath(3.5)))
        .ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
    );

    static GrassConveyor = Items.registerItem(
        new Transformer("GrassConveyor")
        .setName("Grass Conveyor")
        .setDescription("It's time to touch some grass. Converts all droplets passing through this conveyor into Grass Droplets worth $120.")
        .setDifficulty(Difficulties.Friendliness)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(10000000)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setSpeed(5)
        .setResult(Droplet.GrassDroplet)
        .setResult(Droplet.MassiveGrassDroplet, Droplet.NativeGrassDroplet)
    );

    static AnticlockwiseConveyorCorner = Items.registerItem(
        new Conveyor("AnticlockwiseConveyorCorner")
        .setName("Anti-clockwise Conveyor Corner")
        .setDescription("Finally, a conveyor that goes anti-clockwise! Originally developed by the legend himself, Speed Bobs, his legacy lives on in the name of transporting droplets.")
        .setDifficulty(Difficulties.Friendliness)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(9500000)), 1, 5)
        .addPlaceableArea(AREAS.BarrenIslands)

        .setSpeed(5)
    );

    static GrassDropper = Items.registerItem(
        new Dropper("GrassDropper")
        .setName("Grass Dropper")
        .setDescription("You need more grass. A Grass Droplet from this dropper touching a Grass Conveyor transforms it into a Massive Grass Droplet worth $550.")
        .setDifficulty(Difficulties.Friendliness)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(34500000)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(80000000)), 2)

        .addPlaceableArea(AREAS.BarrenIslands)
        .setDroplet(Droplet.NativeGrassDroplet)
        .setDropRate(1)
    );

    static IndustrialFurnace = Items.registerItem(
        new Furnace("IndustrialFurnace")
        .setName("Industrial Furnace")
        .setDescription("You're nearing the age of Power. Scroll up the shop; The First Generator awaits you. Throwing that aside, this Furnace has a $200x boost.")
        .setDifficulty(Difficulties.Friendliness)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(440000000)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)
        
        .setProcessValue(new Price().setCost("Funds", new InfiniteMath(200)))
    );

    static TheFirstGenerator = Items.registerItem(
        new Generator("TheFirstGenerator")
        .setName("The First Generator")
        .setDescription("Start producing Power at +1 W/s.")
        .setDifficulty(Difficulties.TheFirstDifficulty)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(1000000000)), 1)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(1450000000)).setCost("Power", new InfiniteMath(50)), 2)
        .addPlaceableArea(AREAS.BarrenIslands)
        
        .setPassiveGain(new Price().setCost("Power", new InfiniteMath(1)))
        .ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
    );

    static EnergisedRefiner = Items.registerItem(
        new Upgrader("EnergisedRefiner")
        .setName("Energised Refiner")
        .setDescription("Funds boost increases with Power. Uses 0.25 W/s. <log15(power + 1)^1.1 + 1>")
        .setDifficulty(Difficulties.Friendliness)
        .setPrice(new Price().setCost("Power", new InfiniteMath(20)), 1)
        .setPrice(new Price().setCost("Power", new InfiniteMath(120)), 2)
        .addPlaceableArea(AREAS.BarrenIslands)

        .onInit((utils, item) => utils.applyFormula((v) => item.setMul(v), () => utils.getBalance().getCost("Power") ?? new InfiniteMath(0), 
            (x) => (new Price().setCost("Funds", InfiniteMath.log(x.add(1), 15).pow(1.1).add(1)))))
        .setMaintenance(new Price().setCost("Power", new InfiniteMath(0.25)))
    );

    static EnergisedFurnace = Items.registerItem(
        new Furnace("EnergisedFurnace")
        .setName("Energised Furnace")
        .setDescription("Same thing as Energised Refiner, with Funds boost increasing with Power at a slightly weaker scale. Uses 0.3 W/s. <100 * log20(power + 1)^1.1 + 200>")
        .setDifficulty(Difficulties.Friendliness)
        .setPrice(new Price().setCost("Power", new InfiniteMath(75)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)
        
        .onInit((utils, item) => utils.applyFormula((v) => item.setProcessValue(v), () => utils.getBalance().getCost("Power") ?? new InfiniteMath(0), 
            (x) => (new Price().setCost("Funds", InfiniteMath.log(x.add(1), 20).pow(1.1).mul(100).add(200)))))
        .setMaintenance(new Price().setCost("Power", new InfiniteMath(0.3)))
    );

    static BasicCharger = Items.registerItem(
        new Charger("BasicCharger")
        .setName("Basic Charger")
        .setDescription("Boosts Power gain of generators within 5 studs radius of this charger by 2x.")
        .setDifficulty(Difficulties.TrueEase)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(3500000000)).setCost("Power", new InfiniteMath(100)), 1)
        .addPlaceableArea(AREAS.BarrenIslands)
        
        .onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2))
        .setRadius(5)
        .setGeneratorBoost(new Price().setCost("Power", new InfiniteMath(2)))
    );

    static ClassLowerNegativeShop = Items.registerItem(
        new Shop("ClassLowerNegativeShop")
        .setName("Class Lower Negative Shop")
        .setDescription("Purchase all of your items here! Well, at least all items below Instant Win difficulty.")
        .setDifficulty(Difficulties.TheFirstDifficulty)
        .addPlaceableArea(AREAS.BarrenIslands)
        .setItems([
            Items.TheFirstDropper,
            Items.TheFirstFurnace,
            Items.TheFirstConveyor,
            Items.TheFirstUpgrader,
            Items.BulkyDropper,
            Items.ImprovedFurnace,
            Items.ExtendedConveyor,
            Items.BasicRefiner,
            Items.BasicCauldron,
            Items.ConveyorCorner,
            Items.HandCrankDropper,
            Items.DropletSlayerMkI,
            Items.HeavyweightDropper,
            Items.DirectDropletWasher,
            Items.InstantiationDelimiterI,
            Items.LaserFan,
            Items.VolatileCauldron,
            Items.ButtonFurnace,
            Items.SmallReactor,
            Items.GrassConveyor,
            Items.AnticlockwiseConveyorCorner,
            Items.GrassDropper,
            Items.IndustrialFurnace,
            Items.TheFirstGenerator,
            Items.EnergisedRefiner,
            Items.EnergisedFurnace,
            Items.BasicCharger
        ])
    );

    // BONUSES

    static Stud = Items.registerItem(
        new Item("Stud")
        .setName("Stud")
        .setDescription("Stud")
        .setDifficulty(Difficulties.Bonuses)
        .setPrice(new Price().setCost("Funds", new InfiniteMath(1)), 1)
    );

    static SuspiciousStud = Items.registerItem(
        new Shop("SuspiciousStud")
        .setName("Suspicious Stud")
        .setDifficulty(Difficulties.Bonuses)
        .setItems([
            Items.Stud
        ])
    );

    static registerItem<T extends Item>(item: T) {
        Items.ITEMS.push(item);
        return item;
    }

    static getItem(itemId: string) {
        for (const item of Items.ITEMS) {
            if (item.id === itemId)
                return item;
        }
        return undefined;
    }
}

export = Items;