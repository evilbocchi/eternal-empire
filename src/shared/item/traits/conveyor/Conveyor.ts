import { findBaseParts, getAllInstanceInfo } from "@antivivi/vrldk";
import { getAsset } from "shared/asset/AssetMap";
import GameSpeed from "shared/GameSpeed";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import { VirtualAttribute } from "shared/item/utils/VirtualReplication";

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
     * Loads the conveyor arrow visual effect on the given conveyor model.
     * By default, the conveyor arrow is disabled.
     *
     * @param model The model to load the conveyor arrow on.
     * @param conveyor The conveyor to load the conveyor arrow for.
     * @returns A map of each conveyor part to its beam and speed updater.
     */
    static loadConveyorArrow(model: Model, conveyor: Conveyor) {
        const statsPerPart = this.getStats(model, conveyor);
        const beamPerPart = new Map<BasePart, { beam: Beam; updateSpeed: (speed: number) => void }>();
        for (const [part, stats] of statsPerPart) {
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

            part.FrontSurface = Enum.SurfaceType.Studs;
            part.CustomPhysicalProperties = Conveyor.PHYSICAL_PROPERTIES;

            const updateSpeed = (speed: number) => {
                beam.TextureSpeed = speed / beam.TextureLength;
                part.AssemblyLinearVelocity = part.CFrame.LookVector.mul((stats.inverted ? -1 : 1) * speed);
            };
            updateSpeed(stats.speed);
            beam.Parent = part;
            beamPerPart.set(part, { beam, updateSpeed });
        }
        return beamPerPart;
    }

    /**
     * Retrieves all conveyor parts and their stats from the given model and conveyor.
     * @param model The model to search.
     * @param conveyor The conveyor to get stats for.
     * @returns The conveyor parts and their stats.
     */
    static getStats(model: Model, conveyor: Conveyor) {
        const conveyors = findBaseParts(model, "Conveyor");
        const statsPerPart = new Map<BasePart, { speed: number; inverted: boolean }>();

        for (const conveyorPart of conveyors) {
            const overwrite = conveyorPart.FindFirstChild("BaseSpeed") as IntValue | undefined;
            statsPerPart.set(conveyorPart, {
                speed: (overwrite?.Value ?? conveyor.speed ?? 1) * GameSpeed.speed,
                inverted: (conveyorPart.FindFirstChild("Inverted") as BoolValue | undefined)?.Value ?? false,
            });
        }
        return statsPerPart;
    }

    /**
     * Applies the conveyor properties to the given model.
     *
     * @param model The model to load.
     * @param conveyor The conveyor to load.
     */
    static load(model: Model, conveyor: Conveyor) {
        const instanceInfo = getAllInstanceInfo(model);
        const statsPerPart = this.getStats(model, conveyor);

        const updateSpeed = () => {
            let speedBoost = 0;
            const boosts = instanceInfo.Boosts;
            if (boosts !== undefined) {
                for (const [_, boost] of boosts) {
                    speedBoost += boost.charger?.item.findTrait("Accelerator")?.boost ?? 0;
                }
            }
            for (const [part, { speed: baseSpeed, inverted }] of statsPerPart) {
                let speed = baseSpeed;
                speed += speedBoost;
                VirtualAttribute.setNumber(model, part, "Speed", speed);
                part.AssemblyLinearVelocity = part.CFrame.LookVector.mul((inverted ? -1 : 1) * speed);
            }
        };
        updateSpeed();
        instanceInfo.UpdateSpeed = updateSpeed;
    }

    static clientLoad(model: Model, conveyor: Conveyor) {
        const loadedArrows = this.loadConveyorArrow(model, conveyor);
        for (const [basePart, { updateSpeed }] of loadedArrows) {
            VirtualAttribute.observeNumber(model, basePart, "Speed", updateSpeed);
        }
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
        item.onClientLoad((model) => Conveyor.clientLoad(model, this));
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
}
