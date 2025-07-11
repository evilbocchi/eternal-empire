import { Debris, Players, TweenService } from "@rbxts/services";
import Price from "shared/Price";
import Difficulties from "shared/difficulty/Difficulties";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import Dropper from "./Dropper";
import ItemUtils from "./ItemUtils";

class Droplet {

    static DROPLETS: Droplet[] = [];

    static TheFirstDroplet = Droplet.registerDroplet(
        new Droplet("TheFirstDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(1, 1, 1);
            droplet.Color = Difficulties.TheFirstDifficulty.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.TheLowerGap.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.Negativity.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.Negativity.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.Friendliness.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.Friendliness.getColor() ?? new Color3();
            droplet.Material = Enum.Material.Grass;
            return droplet;
        })
        .setValue(new Price().setCost("Funds", 120))
    );

    static MassiveGrassDroplet = Droplet.registerDroplet(
        new Droplet("MassiveGrassDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(2, 2, 2);
            droplet.Color = Difficulties.Friendliness.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.TrueEase.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.FelixTheA.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.Exist.getColor() ?? new Color3();
            droplet.Material = Enum.Material.Slate;
            return droplet;
        })
        .setValue(new Price().setCost("Funds", 8000).setCost("Power", 8))
    );

    static RustyAmethystDroplet = Droplet.registerDroplet(
        new Droplet("RustyAmethystDroplet")
        .setModel(() => {
            const droplet = new Instance("Part");
            droplet.Size = new Vector3(1, 1, 1);
            droplet.Color = Difficulties.ReversedPeripherality.getColor() ?? new Color3();
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
            droplet.Color = Difficulties.ReversedPeripherality.getColor() ?? new Color3();
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

    static registerDroplet(droplet: Droplet) {
        Droplet.DROPLETS.push(droplet);
        return droplet;
    }

    id: string;
    model: Instance | undefined = undefined;
    value: Price | undefined = undefined;

    constructor(id: string) {
        this.id = id;
    }

    getInstantiator(dropperModel: Model, cframe: CFrame, utils: ItemUtils) {
        const model = this.getModel()?.Clone();
        if (model === undefined)
            error("No model found for droplet " + this.id);
        const isBasePart = model.IsA("BasePart");
        if (isBasePart) {
            model.CFrame = cframe;
        }
        model.SetAttribute("ItemId", dropperModel.GetAttribute("ItemId"));
        model.SetAttribute("Area", utils.getPlacedItem(dropperModel.Name)?.area);
        return () => {
            const clone = model.Clone();
            const players = Players.GetPlayers();
            clone.Parent = utils.getPlacedItems();
            if (isBasePart && players.size() === 1) {
                (clone as BasePart).SetNetworkOwner(players[0]);
            }
            task.spawn(() => {
                let prev = new Vector3(0, 10000, 0); // random value
                while (clone.Parent !== undefined) {
                    if (isBasePart) {
                        if ((clone as BasePart).Position.sub(prev).Magnitude < 1) {
                            Debris.AddItem(clone, 1);
                            TweenService.Create(clone as BasePart, new TweenInfo(0.5), {Transparency: 1}).Play();
                            break;
                        }
                        prev = (clone as BasePart).Position;
                    }
                    task.wait(5);
                }
            });
            return 
        };
    }

    getModel() {
        return this.model;
    }

    setModel(modelFunc: () => Instance) {
        this.model = modelFunc();
        this.model.Name = "Droplet";
        this.model.SetAttribute("DropletId", this.id);
        if (this.model.IsA("BasePart")) {
            this.model.CollisionGroup = "Droplets";
        }
        for (const p of this.model.GetDescendants()) {
            if (p.IsA("BasePart")) {
                p.CollisionGroup = "Droplets";
            }
        }
        const re = new Instance("UnreliableRemoteEvent");
        re.Parent = this.model;
        return this;
    }

    getValue() {
        return this.value; 
    }

    setValue(value: Price) {
        this.value = value;
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