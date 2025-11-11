//!native
//!optimize 2

import { getAllInstanceInfo } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import { CollectionService, Debris, RunService, TweenService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { ASSETS } from "shared/asset/GameAssets";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";

declare global {
    interface InstanceInfo {
        /**
         * The health of this droplet instance.
         */
        health?: number;

        /**
         * The unique ID of this droplet instance.
         */
        dropletId?: string;

        /**
         * The item ID this instance represents.
         *
         * If the instance is a droplet model, this will be the item that spawned it.
         */
        itemId?: string;

        /**
         * The area this instance belongs to.
         */
        areaId?: AreaId;

        /**
         * Fired when this instance has been touched by a droplet.
         * @param droplet The droplet that was touched.
         * @param dropletInfo The information about the droplet.
         */
        dropletTouched?: (droplet: BasePart, dropletInfo: InstanceInfo) => void;
    }

    interface DropletAssets extends Folder {
        Ball: MeshPart;
    }

    interface Assets {
        Droplet: DropletAssets;
    }
}

export default class Droplet {
    static readonly DROPLETS = new Array<Droplet>();

    static TheFirstDroplet = Droplet.registerDroplet(
        new Droplet("TheFirstDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.TheFirstDifficulty.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 1)),
    );

    static FatDroplet = Droplet.registerDroplet(
        new Droplet("FatDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.5, 1.5, 1.5);
                droplet.Color = Difficulty.TheLowerGap.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 4)),
    );

    static ManualDroplet = Droplet.registerDroplet(
        new Droplet("ManualDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Negativity.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 15)),
    );

    static HeavyweightDroplet = Droplet.registerDroplet(
        new Droplet("HeavyweightDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.75, 1.75, 1.75);
                droplet.Color = Difficulty.Negativity.color!;
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 160)),
    );

    static GrassDroplet = Droplet.registerDroplet(
        new Droplet("GrassDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Friendliness.color!;
                droplet.Material = Enum.Material.Grass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 120)),
    );

    static NativeGrassDroplet = Droplet.registerDroplet(
        new Droplet("NativeGrassDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Friendliness.color!;
                droplet.Material = Enum.Material.Grass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 120)),
    );

    static RustyDroplet = Droplet.registerDroplet(
        new Droplet("RustyDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.9, 0.9, 0.9);
                droplet.Color = Color3.fromRGB(160, 95, 53);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 180)),
    );

    static MassiveGrassDroplet = Droplet.registerDroplet(
        new Droplet("MassiveGrassDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(2, 2, 2);
                droplet.Color = Difficulty.Friendliness.color!;
                droplet.Material = Enum.Material.Grass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 650)),
    );

    static VibrantDroplet = Droplet.registerDroplet(
        new Droplet("VibrantDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(2, 2, 2);
                droplet.Color = Difficulty.TrueEase.color!;
                droplet.Material = Enum.Material.Neon;
                droplet.AddTag("Rainbow");
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 24000)),
    );

    static CommunismFundsDroplet = Droplet.registerDroplet(
        new Droplet("CommunismFundsDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = new Color3(1, 0, 0);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 3600)),
    );

    static CommunismPowerDroplet = Droplet.registerDroplet(
        new Droplet("CommunismPowerDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = new Color3(1, 1, 0);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 4)),
    );

    static CommunismDroplet = Droplet.registerDroplet(
        new Droplet("CommunismDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Color3.fromRGB(255, 89, 89);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 4000).set("Power", 3)),
    );

    static EnergyPoweredDroplet = Droplet.registerDroplet(
        new Droplet("EnergyPoweredDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 89, 89);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 12000)),
    );

    static LegDayDroplet = Droplet.registerDroplet(
        new Droplet("LegDayDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.1, 1.1, 1.1);
                droplet.Color = Color3.fromRGB(145, 145, 145);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 10000).set("Power", 15)),
    );

    static CrystalDroplet = Droplet.registerDroplet(
        new Droplet("CrystalDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.8, 0.8, 0.8);
                droplet.Color = Color3.fromRGB(224, 105, 240);
                droplet.Material = Enum.Material.Ice;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 20000)),
    );

    static LiquidFundsDroplet = Droplet.registerDroplet(
        new Droplet("LiquidFundsDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Difficulty.FelixTheDA.color!;
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 100000)),
    );

    static LiquidPowerDroplet = Droplet.registerDroplet(
        new Droplet("LiquidPowerDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 163, 89);
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 100)),
    );

    static RapidDroplet = Droplet.registerDroplet(
        new Droplet("RapidDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.9, 0.9, 0.9);
                droplet.Color = Difficulty.Exist.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 16000).set("Power", 16)),
    );

    static RustyAmethystDroplet = Droplet.registerDroplet(
        new Droplet("RustyAmethystDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.ReversedPeripherality.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 34000)),
    );

    static AmethystDroplet = Droplet.registerDroplet(
        new Droplet("AmethystDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.ReversedPeripherality.color!;
                droplet.Material = Enum.Material.Metal;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 78000)),
    );

    static Char = Droplet.registerDroplet(
        new Droplet("Char")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = new Color3();
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 1)),
    );

    static LiquiderFundsDroplet = Droplet.registerDroplet(
        new Droplet("LiquiderFundsDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 166, 0);
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 3000000)),
    );

    static LiquiderPowerDroplet = Droplet.registerDroplet(
        new Droplet("LiquiderPowerDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 130, 28);
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 100000)),
    );

    static VitalizedDroplet = Droplet.registerDroplet(
        new Droplet("VitalizedDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.2, 1.2, 1.2);
                droplet.Color = Difficulty.Restful.color!;
                droplet.Material = Enum.Material.Glass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 40000).set("Power", 2000))
            .setHealth(140),
    );

    static DepressingDroplet = Droplet.registerDroplet(
        new Droplet("DepressingDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Ifinity.color!;
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 0.01)),
    );

    static FundsCompactDroplet = Droplet.registerDroplet(
        new Droplet("FundsCompactDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(0, 255, 0);
                droplet.Material = Enum.Material.Glass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 100000)),
    );

    static PowerCompactDroplet = Droplet.registerDroplet(
        new Droplet("PowerCompactDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 163, 89);
                droplet.Material = Enum.Material.Glass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 6000)),
    );

    static PurifiersDroplet = Droplet.registerDroplet(
        new Droplet("PurifiersDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 138, 255);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Purifier Clicks", 400)),
    );

    static ManualV2Droplet = Droplet.registerDroplet(
        new Droplet("ManualV2Droplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Millisecondless.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 100000)),
    );

    static LiquidestFundsDroplet = Droplet.registerDroplet(
        new Droplet("LiquidestFundsDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 135, 235);
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 30000000)),
    );

    static LiquidestPowerDroplet = Droplet.registerDroplet(
        new Droplet("LiquidestPowerDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 51, 222);
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 5000000)),
    );

    static SpatialDroplet = Droplet.registerDroplet(
        new Droplet("SpatialDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Astronomical.color!;
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 2000)),
    );

    static HydratingDroplet = Droplet.registerDroplet(
        new Droplet("HydratingDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Difficulty.Win.color!;
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setHealth(130)
            .setValue(new CurrencyBundle().set("Power", 8000)),
    );

    static BasicCoin = Droplet.registerDroplet(
        new Droplet("BasicCoin")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Winsome.color!;
                droplet.Material = Enum.Material.Ice;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Bitcoin", 1)),
    );

    static DoubleCoin = Droplet.registerDroplet(
        new Droplet("DoubleCoin")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.95, 0.95, 0.95);
                droplet.Color = Difficulty.Blessing.color!;
                droplet.Material = Enum.Material.Ice;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Bitcoin", 2)),
    );

    static QuadrupleCoin = Droplet.registerDroplet(
        new Droplet("QuadrupleCoin")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.9, 0.9, 0.9);
                droplet.Color = Difficulty.JustAir.color!;
                droplet.Material = Enum.Material.Ice;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Bitcoin", 4)),
    );

    static SkillDroplet = Droplet.registerDroplet(
        new Droplet("SkillDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.9, 0.9, 0.9);
                droplet.Color = Difficulty.Blessing.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Skill", 0.01)),
    );

    static ClassicDroplet = Droplet.registerDroplet(
        new Droplet("ClassicDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.96, 0.96, 0.96);
                droplet.Color = Difficulty.Vintage.color!;
                droplet.Material = Enum.Material.Basalt;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 200000)),
    );

    static LunaryDroplet = Droplet.registerDroplet(
        new Droplet("LunaryDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Vintage.color!;
                droplet.Material = Enum.Material.Glass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 480000).set("Power", 20000)),
    );

    static SkillerDroplet = Droplet.registerDroplet(
        new Droplet("SkillerDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.875, 0.875, 0.875);
                droplet.Color = Difficulty.Walkthrough.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Skill", 0.06)),
    );

    static HappyDroplet = Droplet.registerDroplet(
        new Droplet("HappyDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Happylike.color!;
                droplet.Material = Enum.Material.Glass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 1600000).set("Power", 280000).set("Skill", 0.08)),
    );

    static SolarDroplet = Droplet.registerDroplet(
        new Droplet("SolarDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Walkthrough.color!;
                droplet.Material = Enum.Material.Glass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 500000).set("Power", 70000).set("Skill", 0.02)),
    );

    static OctupleCoin = Droplet.registerDroplet(
        new Droplet("OctupleCoin")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.9, 0.9, 0.9);
                droplet.Color = Difficulty.AutomaticJoyful.color!;
                droplet.Material = Enum.Material.Ice;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Bitcoin", 8)),
    );

    static SkillestDroplet = Droplet.registerDroplet(
        new Droplet("SkillestDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.875, 0.875, 0.875);
                droplet.Color = Difficulty.Unlosable.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Skill", 0.12)),
    );

    static LiquidesterFundsDroplet = Droplet.registerDroplet(
        new Droplet("LiquidesterFundsDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(252, 105, 230);
                droplet.Material = Enum.Material.Cardboard;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 700000000)),
    );

    static LiquidesterPowerDroplet = Droplet.registerDroplet(
        new Droplet("LiquidesterPowerDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(255, 5, 214);
                droplet.Material = Enum.Material.Cardboard;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 100000000)),
    );

    static LiquidesterBitcoinDroplet = Droplet.registerDroplet(
        new Droplet("LiquidesterBitcoinDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.25, 1.25, 1.25);
                droplet.Color = Color3.fromRGB(71, 5, 255);
                droplet.Material = Enum.Material.Cardboard;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Bitcoin", 10000)),
    );

    static SexdecupleCoin = Droplet.registerDroplet(
        new Droplet("SexdecupleCoin")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.91, 0.91, 0.91);
                droplet.Color = Difficulty.Unlosable.color!;
                droplet.Material = Enum.Material.Ice;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Bitcoin", 16).set("Skill", 0.15)),
    );

    static HandCrankedCoin = Droplet.registerDroplet(
        new Droplet("HandCrankedCoin")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.91, 0.91, 0.91);
                droplet.Color = Difficulty.Frivolous.color!;
                droplet.Material = Enum.Material.Ice;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Bitcoin", 24)),
    );

    static SphericalDroplet = Droplet.registerDroplet(
        new Droplet("SphericalDroplet")
            .setModel(() => {
                const droplet = ASSETS.Droplet.Ball.Clone();
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Color3.fromRGB(58, 125, 21);
                droplet.Anchored = false;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Skill", 0.1))
            .setHealth(10),
    );

    static ShatteredDroplet = Droplet.registerDroplet(
        new Droplet("ShatteredDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Color3.fromRGB(113, 16, 171);
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 200000)),
    );

    static TotalityDroplet = Droplet.registerDroplet(
        new Droplet("TotalityDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(2, 2, 2);
                droplet.Color = Difficulty.Spontaneous.color!;
                droplet.Material = Enum.Material.Neon;
                return droplet;
            })
            .setValue(
                new CurrencyBundle().set("Funds", 10000000).set("Power", 10000000).set("Bitcoin", 1000).set("Skill", 1),
            ),
    );

    static LuckyDroplet = Droplet.registerDroplet(
        new Droplet("LuckyDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Color3.fromRGB(140, 255, 245);
                droplet.Material = Enum.Material.Neon;

                const light = new Instance("PointLight");
                light.Color = new Color3(0.5, 1, 0.87);
                light.Shadows = false;
                light.Range = 10;
                light.Brightness = 0.5;
                light.Parent = droplet;

                return droplet;
            })
            .setValue(new CurrencyBundle().set("Diamonds", 1)),
    );

    static MovementDroplet = Droplet.registerDroplet(
        new Droplet("MovementDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.4, 1.4, 1.4);
                droplet.Color = Difficulty.DoSomething.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Funds", 150000)),
    );

    static BalloonDroplet = Droplet.registerDroplet(
        new Droplet("BalloonDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(0.6, 0.6, 0.6);
                droplet.Color = Difficulty.DoSomething.color!;
                droplet.Material = Enum.Material.Glass;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Power", 200000)),
    );

    static StuddedDroplet = Droplet.registerDroplet(
        new Droplet("StuddedDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1.2, 1.2, 1.2);
                droplet.Color = Difficulty.AutomaticJoyful.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Skill", 0.05).set("Purifier Clicks", 5000).set("Power", 125000))
            .setHealth(120),
    );

    static PlacidDroplet = Droplet.registerDroplet(
        new Droplet("PlacidDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Placid.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Skill", 1)),
    );

    static UnrealDroplet = Droplet.registerDroplet(
        new Droplet("UnrealDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.Unreal.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new CurrencyBundle().set("Time", 1)),
    );

    /**
     * Registers a droplet to the droplet list.
     *
     * @param droplet The droplet to register.
     * @returns The registered droplet.
     */
    static registerDroplet(droplet: Droplet) {
        Droplet.DROPLETS.push(droplet);
        return droplet;
    }

    /**
     * The default physical properties of droplets.
     */
    static readonly PHYSICAL_PROPERTIES = new PhysicalProperties(2, 2, 0.15);

    /**
     * Spawned droplets in the world with their {@link InstanceInfo}.
     */
    static readonly SPAWNED_DROPLETS = new Map<BasePart, InstanceInfo>();
    static readonly MODEL_PER_SPAWN_ID = new Map<string, BasePart>();

    /**
     * Basic counter for droplet instantiation.
     * Used for naming droplets.
     */
    static instatiationCount = 0;

    /**
     * The model of the droplet.
     * Should be set with {@link Droplet.setModel} before the droplet is used.
     */
    model!: BasePart;

    /**
     * The value of the droplet.
     * Should be set with {@link Droplet.setValue} before the droplet is used.
     */
    value!: CurrencyBundle;

    /**
     * The starting health of the droplet.
     */
    health = 100;

    /**
     * Constructs a new droplet at the given ID.
     *
     * @param id The ID of the droplet.
     */
    constructor(public readonly id: string) {}

    /**
     * Factory method to create a droplet from an item model and a CFrame.
     *
     * @param dropperModel The model of the dropper.
     * @param drop The drop part.
     * @returns The instantiator function for the droplet.
     */
    getInstantiator(dropperModel: Model, drop?: BasePart) {
        const cframe = drop === undefined ? undefined : drop.CFrame;

        const model = this.model.Clone();
        if (cframe !== undefined) {
            model.CFrame = cframe;
        }
        const health = this.health;
        const dropperModelInfo = getAllInstanceInfo(dropperModel);
        const itemId = dropperModelInfo.itemId;
        const areaId = Server.Item.getPlacedItem(dropperModel.Name)?.area as AreaId | undefined;

        return () => {
            const spawned = model.Clone();
            spawned.CustomPhysicalProperties = Droplet.PHYSICAL_PROPERTIES;

            const instanceInfo = getAllInstanceInfo(spawned);
            instanceInfo.upgrades = new Map();
            instanceInfo.health = health;
            instanceInfo.dropletId = this.id;
            instanceInfo.itemId = itemId;
            instanceInfo.areaId = areaId;

            spawned.Touched.Connect((part) => {
                getAllInstanceInfo(part).dropletTouched?.(spawned, instanceInfo);
            });

            const spawnId = tostring(++Droplet.instatiationCount);
            spawned.Name = spawnId;

            Droplet.SPAWNED_DROPLETS.set(spawned, instanceInfo);
            Droplet.MODEL_PER_SPAWN_ID.set(spawnId, spawned);
            let destroyed = false;
            spawned.Destroying.Once(() => {
                destroyed = true;
                Droplet.SPAWNED_DROPLETS.delete(spawned);
                Droplet.MODEL_PER_SPAWN_ID.delete(spawnId);
            });

            let prev: Vector3 | undefined;
            const checkStillness = () => {
                if (destroyed === true) return;
                if (prev !== undefined && (spawned as BasePart).Position.sub(prev).Magnitude < 0.5) {
                    Debris.AddItem(spawned, 1);
                    TweenService.Create(spawned as BasePart, new TweenInfo(0.5), { Transparency: 1 }).Play();
                    return;
                }
                prev = (spawned as BasePart).Position;
                task.delay(10, checkStillness);
            };
            task.delay(10, checkStillness);

            eat(spawned, "Destroy");

            return spawned;
        };
    }

    /**
     * Sets the model of the droplet.
     *
     * @param modelFunc The function to create the model of the droplet.
     * @returns This droplet.
     */
    setModel(modelFunc: () => BasePart) {
        const model = modelFunc();
        model.Name = "Droplet";
        model.CollisionGroup = "Droplet";
        model.CanQuery = false;
        model.CanTouch = true;
        model.CastShadow = false;
        model.AddTag("Droplet");
        this.model = model;
        return this;
    }

    /**
     * Sets the value of the droplet.
     *
     * @param value The value of the droplet.
     * @returns This droplet.
     */
    setValue(value: CurrencyBundle) {
        this.value = value;
        return this;
    }

    /**
     * Sets the starting health of the droplet.
     *
     * @param health The starting health value to set for the droplet.
     * @returns This droplet.
     */
    setHealth(health: number) {
        this.health = health;
        return this;
    }

    /**
     * Gets the droplet at the given ID.
     *
     * @param dropletId The ID of the droplet to get.
     * @returns The droplet at the given ID, or undefined if not found.
     */
    static getDroplet(dropletId: string) {
        for (const droplet of Droplet.DROPLETS) {
            if (droplet.id === dropletId) return droplet;
        }
        return undefined;
    }

    static {
        const heartbeatConnection = RunService.Heartbeat.Connect(() => {
            for (const [dropletModel, instanceInfo] of this.SPAWNED_DROPLETS) {
                if (instanceInfo.health === undefined) continue;

                if (instanceInfo.health <= 0 || dropletModel.Position.Y > 1000) {
                    this.SPAWNED_DROPLETS.delete(dropletModel);
                    this.MODEL_PER_SPAWN_ID.delete(dropletModel.Name);
                    dropletModel.Anchored = true;
                    dropletModel.Transparency = 1;
                    Debris.AddItem(dropletModel, 6);
                    const explosion = new Instance("Explosion");
                    explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                    explosion.DestroyJointRadiusPercent = 0;
                    explosion.BlastRadius = 0;
                    explosion.Position = dropletModel.Position;
                    explosion.Parent = dropletModel;
                    continue;
                }
            }
        });
        eat(heartbeatConnection);

        if (!IS_SERVER || IS_EDIT) {
            const addedConnection = CollectionService.GetInstanceAddedSignal("Droplet").Connect((droplet) => {
                if (!droplet.IsA("BasePart")) return;
                const dropletModelId = droplet.Name;

                Droplet.MODEL_PER_SPAWN_ID.set(dropletModelId, droplet);
                droplet.Destroying.Once(() => {
                    Droplet.MODEL_PER_SPAWN_ID.delete(dropletModelId);
                });
            });
            eat(addedConnection, "Disconnect");

            const impulseConnection = Packets.setVelocity.fromServer((dropletModelId, velocity) => {
                const model = this.MODEL_PER_SPAWN_ID.get(dropletModelId);
                if (model === undefined) return;
                model.AssemblyLinearVelocity = velocity;
            });
            eat(impulseConnection, "Disconnect");
        }
    }
}
