import { findBaseParts, getAllInstanceInfo } from "@antivivi/vrldk";
import { CollectionService, RunService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import GameSpeed from "shared/GameSpeed";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Conveyor: Conveyor;
    }

    interface InstanceInfo {
        UpdateSpeed?: () => void;
    }
}

/**
 * An {@link Item} in which its model contains `Conveyor` {@link BasePart}s that move items along a path.
 */
export default class Conveyor extends ItemTrait {
    /**
     * Loads the conveyor arrow visual effect on the given conveyor part.
     * By default, the conveyor arrow is disabled.
     *
     * @param part The conveyor BasePart to which the arrow will be attached.
     * @param conveyor The conveyor instance to which the part belongs.
     * @returns The Beam instance representing the conveyor arrow.
     */
    static loadConveyorArrow(part: BasePart, conveyor?: Conveyor) {
        const width = part.Size.X;
        const beam = new Instance("Beam");
        beam.Name = "ConveyorArrow";
        beam.Texture = getAsset("assets/ConveyorArrow.png");
        beam.Segments = 10;
        beam.Width0 = width;
        beam.Width1 = width;
        beam.TextureMode = Enum.TextureMode.Static;
        beam.TextureLength = beam.Width0;
        beam.Transparency = new NumberSequence(0.25);
        beam.Color = new ColorSequence(Color3.fromRGB(0, 209, 255));
        beam.LightInfluence = 1;
        beam.LightEmission = 1;
        beam.ZOffset = 0.2;
        beam.Enabled = false;

        const attachment0 = part.FindFirstChild("Attachment0") as Attachment | undefined;
        const attachment1 = part.FindFirstChild("Attachment1") as Attachment | undefined;
        if (part.GetAttribute("Inverted")) {
            beam.Attachment0 = attachment1;
            beam.Attachment1 = attachment0;
        } else {
            beam.Attachment0 = attachment0;
            beam.Attachment1 = attachment1;
        }

        const updateSpeed = () => {
            let speed = part.GetAttribute("Speed") as number | undefined;
            if (speed === undefined) {
                speed = conveyor?.getSpeed() ?? 1;
            }
            beam.TextureSpeed = speed / beam.TextureLength;
        };
        const connection = part.GetAttributeChangedSignal("Speed").Connect(updateSpeed);
        part.AncestryChanged.Connect((_, parent) => {
            if (parent === undefined) {
                connection.Disconnect();
            }
        });
        updateSpeed();
        beam.Parent = part;
        return beam;
    }

    /**
     * Applies the conveyor properties to the given model.
     *
     * @param model The model to load.
     * @param conveyor The conveyor to load.
     */
    static load(model: Model, conveyor: Conveyor) {
        const instanceInfo = getAllInstanceInfo(model);
        const conveyors = findBaseParts(model, "Conveyor");
        const statsPerPart = new Map<BasePart, { speed: number; inverted: boolean }>();

        for (const conveyorPart of conveyors) {
            conveyorPart.FrontSurface = Enum.SurfaceType.Studs;
            conveyorPart.CustomPhysicalProperties = Conveyor.PHYSICAL_PROPERTIES;
            const overwrite = conveyorPart.FindFirstChild("BaseSpeed") as IntValue | undefined;
            statsPerPart.set(conveyorPart, {
                speed: overwrite?.Value ?? conveyor.getSpeed() ?? 1,
                inverted: (conveyorPart.FindFirstChild("Inverted") as BoolValue | undefined)?.Value ?? false,
            });
        }

        const updateSpeed = () => {
            let speedBoost = 0;
            const boosts = instanceInfo.Boosts;
            if (boosts !== undefined) {
                for (const [_, boost] of boosts) {
                    speedBoost += boost.charger?.item.findTrait("Accelerator")?.boost ?? 0;
                }
            }
            for (const conveyorPart of conveyors) {
                const { speed: baseSpeed, inverted } = statsPerPart.get(conveyorPart)!;
                let speed = baseSpeed;
                speed += speedBoost;
                conveyorPart.SetAttribute("Speed", speed);
                conveyorPart.AddTag("Conveyor");
                conveyorPart.AssemblyLinearVelocity = conveyorPart.CFrame.LookVector.mul((inverted ? -1 : 1) * speed);
            }
        };
        updateSpeed();
        instanceInfo.UpdateSpeed = updateSpeed;
    }

    /**
     * The physical properties of the conveyor.
     */
    static readonly PHYSICAL_PROPERTIES = new PhysicalProperties(0.7, 0.4, 0, 1, 1);

    /**
     * The speed of all `Conveyor` {@link BasePart}s in the conveyor.
     */
    speed = 1;

    /**
     * Constructs a new conveyor.
     *
     * @param item The item to which this conveyor belongs.
     */
    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Conveyor.load(model, this));
    }

    /**
     * Sets the speed of the conveyor.
     *
     * @param speed The speed of the conveyor.
     * @returns This conveyor.
     */
    setSpeed(speed: number) {
        this.speed = speed;
        return this;
    }

    /**
     * Retrieves the current speed of the conveyor adjusted by the game speed.
     *
     * @returns The adjusted speed of the conveyor.
     */
    getSpeed() {
        return this.speed * GameSpeed.speed;
    }

    static {
        if (RunService.IsClient()) {
            CollectionService.GetInstanceAddedSignal("Conveyor").Connect((part) => {
                this.loadConveyorArrow(part as BasePart);
            });
        }
    }
}
