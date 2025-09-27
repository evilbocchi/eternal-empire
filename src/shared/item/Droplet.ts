//!native
//!optimize 2

import Difficulty from "@antivivi/jjt-difficulties";
import { getAllInstanceInfo, getInstanceInfo } from "@antivivi/vrldk";
import { CollectionService, Debris, RunService, TweenService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import UserGameSettings from "shared/api/UserGameSettings";
import { ASSETS } from "shared/asset/GameAssets";
import { IS_SERVER } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Operative from "shared/item/traits/Operative";
import Packets from "shared/Packets";

declare global {
    interface InstanceInfo {
        Health?: number;
        DropletId?: string;
        ItemId?: string;
        Area?: AreaId;

        /**
         * Fired when a droplet is touched by something.
         * @param droplet The droplet that was touched.
         * @param dropletInfo The information about the droplet.
         */
        DropletTouched?: (droplet: BasePart, dropletInfo: InstanceInfo) => void;
        //RaycastParams?: RaycastParams;
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
                droplet.Color = Difficulty.FelixTheA.color!;
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
            .setValue(new CurrencyBundle().set("Funds", 10000000).set("Power", 10000000).set("Skill", 1)),
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
        const itemId = dropperModel.GetAttribute("ItemId") as string;
        const areaId = Server.Item.getPlacedItem(dropperModel.Name)?.area as AreaId | undefined;

        return () => {
            const clone = model.Clone();
            const instanceInfo = getAllInstanceInfo(clone);
            instanceInfo.Upgrades = new Map();
            instanceInfo.Health = health;
            instanceInfo.DropletId = this.id;
            instanceInfo.ItemId = itemId;
            instanceInfo.Area = areaId;

            clone.Touched.Connect((part) => {
                getInstanceInfo(part, "DropletTouched")?.(clone, instanceInfo);
            });

            const spawnId = tostring(++Droplet.instatiationCount);
            clone.Name = spawnId;
            if (cframe !== undefined) {
                Packets.dropletAdded.toClientsInRadius(cframe.Position, 128, drop!);
            }

            Droplet.SPAWNED_DROPLETS.set(clone, instanceInfo);
            Droplet.MODEL_PER_SPAWN_ID.set(spawnId, clone);
            let destroyed = false;
            clone.Destroying.Once(() => {
                destroyed = true;
                Droplet.SPAWNED_DROPLETS.delete(clone);
                Droplet.MODEL_PER_SPAWN_ID.delete(spawnId);
            });

            let prev: Vector3 | undefined;
            const checkStillness = () => {
                if (destroyed === true) return;
                if (prev !== undefined && (clone as BasePart).Position.sub(prev).Magnitude < 0.5) {
                    Debris.AddItem(clone, 1);
                    TweenService.Create(clone as BasePart, new TweenInfo(0.5), { Transparency: 1 }).Play();
                    return;
                }
                prev = (clone as BasePart).Position;
                task.delay(10, checkStillness);
            };
            task.delay(10, checkStillness);
            return clone;
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
        model.CustomPhysicalProperties = Droplet.PHYSICAL_PROPERTIES;
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
     * Coalesce operative terms and the value of the droplet into a single currency bundle.
     *
     * @param totalAdd Total addition term.
     * @param totalMul Total multiplication term.
     * @param totalPow Total power term.
     * @returns The coalesced worth of the droplet.
     */
    coalesce(totalAdd: CurrencyBundle, totalMul: CurrencyBundle, totalPow: CurrencyBundle) {
        return Operative.coalesce(this.value, totalAdd, totalMul, totalPow);
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

    /**
     * Calculates negative status effects applied to the droplet.
     *
     * @param instanceInfo The instance info of the droplet.
     * @returns A tuple containing the nerf value and a boolean indicating if the droplet had reached the skyline.
     */
    static getNerf(instanceInfo: InstanceInfo) {
        let nerf = 1;
        const isSky = instanceInfo.Sky;
        if (isSky === true) {
            nerf /= 250;
        }

        nerf *= math.min(100, instanceInfo.Health!) / 100;
        return $tuple(nerf, isSky);
    }

    static {
        // let this run on both client and server; the instantiatior functions are on the same side
        const offset = new Vector3(0, 1.5, 0);
        const heartbeatConnection = RunService.Heartbeat.Connect(() => {
            for (const [dropletModel, instanceInfo] of this.SPAWNED_DROPLETS) {
                if (instanceInfo.Health === undefined) continue;

                if (instanceInfo.Health <= 0 || dropletModel.Position.Y > 1000) {
                    this.SPAWNED_DROPLETS.delete(dropletModel);
                    this.MODEL_PER_SPAWN_ID.delete(dropletModel.Name);
                    dropletModel.Anchored = true;
                    dropletModel.Transparency = 1;
                    Debris.AddItem(dropletModel, 2);
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

        if (!IS_SERVER) {
            const addedConnection = Packets.dropletAdded.fromServer((drop?: BasePart) => {
                if (!drop) return;

                const originalSize = drop.GetAttribute("OriginalSize") as Vector3 | undefined;
                if (originalSize === undefined) return;

                if (UserGameSettings!.SavedQualityLevel.Value > 1) {
                    drop.Size = originalSize.add(new Vector3(0.15, 0.825, 0.15));
                    TweenService.Create(drop, new TweenInfo(0.3), { Size: originalSize }).Play();
                }
            });
            eat(addedConnection);

            const impulseConnection = Packets.applyImpulse.fromServer((dropletModelId, impulse) => {
                const model = CollectionService.GetTagged("Droplet").find(
                    (droplet) => droplet.Name === dropletModelId,
                ) as BasePart | undefined;
                if (model === undefined)
                    // streamed out
                    return;
                model.ApplyImpulse(impulse);
            });
            eat(impulseConnection);
        }
    }
}
