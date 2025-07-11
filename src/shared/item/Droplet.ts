//!native

import { Debris, TweenService } from "@rbxts/services";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { DROPLETS_FOLDER } from "shared/constants";

class Droplet {

    static DROPLETS: Droplet[] = [];

    static TheFirstDroplet = Droplet.registerDroplet(
        new Droplet("TheFirstDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(1, 1, 1);
            droplet.Color = Difficulty.TheFirstDifficulty.color ?? new Color3();
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
            droplet.Color = Difficulty.TheLowerGap.color ?? new Color3();
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
            droplet.Color = Difficulty.Negativity.color ?? new Color3();
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
            droplet.Color = Difficulty.Negativity.color ?? new Color3();
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
            droplet.Color = Difficulty.Friendliness.color ?? new Color3();
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
            droplet.Color = Difficulty.Friendliness.color ?? new Color3();
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
            droplet.Color = Difficulty.Friendliness.color ?? new Color3();
            droplet.Material = Enum.Material.Grass;
            return droplet;
        })
        .setValue(new Price().setCost("Funds", 550))
    );

    static VibrantDroplet = Droplet.registerDroplet(
        new Droplet("VibrantDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(2, 2, 2);
            droplet.Color = Difficulty.TrueEase.color ?? new Color3();
            droplet.Material = Enum.Material.Neon;
            droplet.SetAttribute("Rainbow", 2);
            return droplet;
        })
        .setValue(new Price().setCost("Funds", 20000))
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

    static LiquidFundsDroplet = Droplet.registerDroplet(
        new Droplet("LiquidFundsDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(1.25, 1.25, 1.25);
            droplet.Color = Difficulty.FelixTheA.color ?? new Color3();
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
            droplet.Color = Difficulty.Exist.color ?? new Color3();
            droplet.Material = Enum.Material.Slate;
            return droplet;
        })
        .setValue(new Price().setCost("Funds", 12000).setCost("Power", 12))
    );

    static RustyAmethystDroplet = Droplet.registerDroplet(
        new Droplet("RustyAmethystDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(1, 1, 1);
            droplet.Color = Difficulty.ReversedPeripherality.color ?? new Color3();
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
            droplet.Color = Difficulty.ReversedPeripherality.color ?? new Color3();
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
            droplet.Color = Difficulty.Restful.color ?? new Color3();
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
            droplet.Color = Difficulty.Ifinity.color ?? new Color3();
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
        .setValue(new Price().setCost("Purifier Clicks", 200))
    );

    static ManualV2Droplet = Droplet.registerDroplet(
        new Droplet("ManualV2Droplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(1, 1, 1);
            droplet.Color = Difficulty.Millisecondless.color ?? new Color3();
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
            droplet.Color = Difficulty.Astronomical.color ?? new Color3();
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
            droplet.Color = Difficulty.Win.color ?? new Color3();
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
            droplet.Color = Difficulty.Winsome.color ?? new Color3();
            droplet.Material = Enum.Material.Ice;
            return droplet;
        })
        .setValue(new Price().setCost("Bitcoin", 1))
    );

    static SkillDroplet = Droplet.registerDroplet(
        new Droplet("SkillDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(0.9, 0.9, 0.9);
            droplet.Color = Difficulty.Blessing.color ?? new Color3();
            droplet.Material = Enum.Material.Slate;
            return droplet;
        })
        .setValue(new Price().setCost("Skill", 0.01))
    );

    static registerDroplet(droplet: Droplet) {
        Droplet.DROPLETS.push(droplet);
        return droplet;
    }

    id: string;
    model: BasePart | undefined = undefined;
    value: Price | undefined = undefined;
    health = 100;

    constructor(id: string) {
        this.id = id;
    }

    getInstantiator(dropperModel: Model, cframe: CFrame, utils: GameUtils) {
        const model = this.model?.Clone();
        if (model === undefined)
            error("No model found for droplet " + this.id);
        model.CanQuery = false;
        model.CFrame = cframe;
        model.CastShadow = false;
        model.SetAttribute("Health", this.health);
        model.SetAttribute("ItemId", dropperModel.GetAttribute("ItemId"));
        model.SetAttribute("Area", utils.getPlacedItem(dropperModel.Name)?.area);
        return () => {
            const clone = model.Clone();
            clone.GetAttributeChangedSignal("Health").Connect(() => {
                const health = clone.GetAttribute("Health") as number | undefined;
                if (health === undefined) {
                    return;
                }
                if (health <= 0) {
                    (clone as BasePart).Anchored = true;
                    (clone as BasePart).Transparency = 1;
                    Debris.AddItem(clone, 2);
                    const explosion = new Instance("Explosion");
                    explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                    explosion.DestroyJointRadiusPercent = 0;
                    explosion.BlastRadius = 0;
                    explosion.Position = (clone as BasePart).Position;
                    explosion.Parent = clone;
                }
            });
            clone.Parent = DROPLETS_FOLDER;
            
            task.spawn(() => {
                let prev = new Vector3(0, 10000, 0); // random value
                while (clone.Parent !== undefined) {
                    if ((clone as BasePart).Position.sub(prev).Magnitude < 1) {
                        Debris.AddItem(clone, 1);
                        TweenService.Create(clone as BasePart, new TweenInfo(0.5), {Transparency: 1}).Play();
                        break;
                    }
                    prev = (clone as BasePart).Position;
                    task.wait(5);
                }
            });
            clone.SetNetworkOwner(undefined);
            return clone;
        };
    }

    setModel(modelFunc: () => BasePart) {
        this.model = modelFunc();
        this.model.Name = "Droplet";
        this.model.SetAttribute("DropletId", this.id);
        this.model.CollisionGroup = "Droplet";
        const re = new Instance("UnreliableRemoteEvent");
        re.Parent = this.model;
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
}

export = Droplet;