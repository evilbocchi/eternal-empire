import Difficulty from "@antivivi/jjt-difficulties";
import { Debris, Players, RunService, TweenService } from "@rbxts/services";
import Price from "shared/Price";
import { DROPLETS_FOLDER } from "shared/constants";
import ItemUtils, { GameUtils } from "shared/utils/ItemUtils";

declare global {
    interface InstanceInfo {
        Health?: number;
        DropletId?: string;
        ItemId?: string;
        Area?: AreaId;
    }
}

class Droplet {

    static DROPLETS: Droplet[] = [];

    static TheFirstDroplet = Droplet.registerDroplet(
        new Droplet("TheFirstDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(1, 1, 1);
                droplet.Color = Difficulty.TheFirstDifficulty.color!;
                droplet.Material = Enum.Material.Slate;
                return droplet;
            })
            .setValue(new Price().setCost("Funds", 1))
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
            .setValue(new Price().setCost("Funds", 4))
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
            .setValue(new Price().setCost("Funds", 15))
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
            .setValue(new Price().setCost("Funds", 110))
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
            .setValue(new Price().setCost("Funds", 120))
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
            .setValue(new Price().setCost("Funds", 120))
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
            .setValue(new Price().setCost("Funds", 180))
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
            .setValue(new Price().setCost("Funds", 650))
    );

    static VibrantDroplet = Droplet.registerDroplet(
        new Droplet("VibrantDroplet")
            .setModel(() => {
                const droplet = new Instance("Part");
                droplet.Size = new Vector3(2, 2, 2);
                droplet.Color = Difficulty.TrueEase.color!;
                droplet.Material = Enum.Material.Neon;
                droplet.SetAttribute("Rainbow", 2);
                return droplet;
            })
            .setValue(new Price().setCost("Funds", 24000))
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
            .setValue(new Price().setCost("Funds", 3600))
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
            .setValue(new Price().setCost("Power", 4))
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
            .setValue(new Price().setCost("Funds", 4000).setCost("Power", 3))
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
            .setValue(new Price().setCost("Funds", 10000).setCost("Power", 15))
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
            .setValue(new Price().setCost("Power", 20000))
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
            .setValue(new Price().setCost("Funds", 100000))
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
            .setValue(new Price().setCost("Power", 100))
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
            .setValue(new Price().setCost("Funds", 16000).setCost("Power", 16))
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
            .setValue(new Price().setCost("Funds", 34000))
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
            .setValue(new Price().setCost("Funds", 78000))
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
            .setValue(new Price().setCost("Funds", 1))
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
            .setValue(new Price().setCost("Funds", 3000000))
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
            .setValue(new Price().setCost("Power", 100000))
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
            .setValue(new Price().setCost("Funds", 40000).setCost("Power", 2000))
            .setHealth(140)
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
            .setValue(new Price().setCost("Funds", 0.01))
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
            .setValue(new Price().setCost("Funds", 100000))
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
            .setValue(new Price().setCost("Power", 6000))
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
            .setValue(new Price().setCost("Purifier Clicks", 400))
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
            .setValue(new Price().setCost("Funds", 100000))
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
            .setValue(new Price().setCost("Funds", 30000000))
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
            .setValue(new Price().setCost("Power", 5000000))
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
            .setValue(new Price().setCost("Funds", 1000))
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
            .setValue(new Price().setCost("Power", 8000))
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
            .setValue(new Price().setCost("Bitcoin", 1))
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
            .setValue(new Price().setCost("Bitcoin", 2))
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
            .setValue(new Price().setCost("Bitcoin", 4))
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
            .setValue(new Price().setCost("Skill", 0.01))
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
            .setValue(new Price().setCost("Funds", 100000))
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
            .setValue(new Price().setCost("Funds", 240000).setCost("Power", 10000))
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
            .setValue(new Price().setCost("Skill", 0.03))
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
            .setValue(new Price().setCost("Funds", 400000).setCost("Power", 70000).setCost("Skill", 0.02))
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
            .setValue(new Price().setCost("Funds", 250000).setCost("Power", 35000).setCost("Skill", 0.01))
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
            .setValue(new Price().setCost("Bitcoin", 8))
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
            .setValue(new Price().setCost("Funds", 700000000))
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
            .setValue(new Price().setCost("Power", 100000000))
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
            .setValue(new Price().setCost("Bitcoin", 16).setCost("Skill", 0.04))
    );


    static registerDroplet(droplet: Droplet) {
        Droplet.DROPLETS.push(droplet);
        return droplet;
    }

    static readonly PHYSICAL_PROPERTIES = new PhysicalProperties(2, 2, 0.15);
    static readonly SPAWNED_DROPLETS = new Map<BasePart, InstanceInfo>();
    static instatiationCount = 0;

    id: string;
    model!: BasePart;
    value!: Price;
    health = 100;

    constructor(id: string) {
        this.id = id;
    }

    getInstantiator(dropperModel: Model, cframe: CFrame) {
        const model = this.model.Clone();
        model.CanQuery = false;
        model.CFrame = cframe;
        model.CastShadow = false;
        model.CustomPhysicalProperties = Droplet.PHYSICAL_PROPERTIES;
        const health = this.health;
        const itemId = dropperModel.GetAttribute("ItemId") as string;
        const areaId = GameUtils.itemsService.getPlacedItem(dropperModel.Name)?.area as AreaId | undefined;
        const empireData = GameUtils.empireData;
        return () => {
            const clone = model.Clone();
            const instanceInfo = GameUtils.getAllInstanceInfo(clone);
            instanceInfo.Health = health;
            instanceInfo.DropletId = this.id;
            instanceInfo.ItemId = itemId;
            instanceInfo.Area = areaId;
            Droplet.SPAWNED_DROPLETS.set(clone, instanceInfo);
            clone.Destroying.Once(() => Droplet.SPAWNED_DROPLETS.delete(clone));
            clone.Name = tostring(++Droplet.instatiationCount);
            clone.Parent = DROPLETS_FOLDER;

            task.spawn(() => {
                let prev = new Vector3(0, 10000, 0); // random value
                while (clone.Parent !== undefined) {
                    if ((clone as BasePart).Position.sub(prev).Magnitude < 0.5) {
                        Debris.AddItem(clone, 1);
                        TweenService.Create(clone as BasePart, new TweenInfo(0.5), { Transparency: 1 }).Play();
                        break;
                    }
                    prev = (clone as BasePart).Position;
                    task.wait(5);
                }
            });
            clone.SetNetworkOwner(ItemUtils.clientDroplets ? Players.GetPlayers().pop() : undefined);
            return clone;
        };
    }

    setModel(modelFunc: () => BasePart) {
        this.model = modelFunc();
        this.model.Name = "Droplet";
        this.model.CollisionGroup = "Droplet";
        return this;
    }

    setValue(value: Price) {
        this.value = value;
        return this;
    }

    setHealth(health: number) {
        this.health = health;
        return this;
    }

    static getDroplet(dropletId: string) {
        for (const droplet of Droplet.DROPLETS) {
            if (droplet.id === dropletId)
                return droplet;
        }
        return undefined;
    }

    static {
        RunService.Heartbeat.Connect(() => {
            for (const [dropletModel, instanceInfo] of this.SPAWNED_DROPLETS) {
                if (instanceInfo.Health === undefined)
                    return;
                if (instanceInfo.Health <= 0) {
                    dropletModel.Anchored = true;
                    dropletModel.Transparency = 1;
                    Debris.AddItem(dropletModel, 2);
                    const explosion = new Instance("Explosion");
                    explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                    explosion.DestroyJointRadiusPercent = 0;
                    explosion.BlastRadius = 0;
                    explosion.Position = dropletModel.Position;
                    explosion.Parent = dropletModel;
                }
            }
        });
    }
}

export = Droplet;