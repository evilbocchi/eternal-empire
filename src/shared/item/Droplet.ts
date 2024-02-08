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
        .setValue(new Price().setCost("Funds", new InfiniteMath(1)))
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
        .setValue(new Price().setCost("Funds", new InfiniteMath(4)))
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
        .setValue(new Price().setCost("Funds", new InfiniteMath(15)))
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
        .setValue(new Price().setCost("Funds", new InfiniteMath(110)))
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
        .setValue(new Price().setCost("Funds", new InfiniteMath(120)))
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
        .setValue(new Price().setCost("Funds", new InfiniteMath(120)))
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
        .setValue(new Price().setCost("Funds", new InfiniteMath(550)))
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