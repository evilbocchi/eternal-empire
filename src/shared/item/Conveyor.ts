import GameSpeed from "shared/GameSpeed";
import Operative from "shared/item/Operative";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

declare global {
    interface ItemTypes {
        Conveyor: Conveyor;
    }
}

class Conveyor extends Operative {

    static getBeam(speed: number, width?: number) {
        const beam = new Instance("Beam");
        beam.Texture = "http://www.roblox.com/asset/?id=247420484";
        beam.Segments = 10;
        beam.Width0 = width ?? 4;
        beam.Width1 = width ?? 4;
        beam.TextureMode = Enum.TextureMode.Static;
        beam.TextureLength = beam.Width0 / 6 * 7;
        beam.Transparency = new NumberSequence(0.7);
        beam.ZOffset = 0.2;
        beam.TextureSpeed = (speed ?? 0) / beam.TextureLength;
        return beam;
    }

    static load(model: Model, item: Conveyor) {
        const speed = (item.speed ?? 1) * GameSpeed.speed;
        const conveyors = findBaseParts(model, "Conveyor");
        for (const d of conveyors) {
            const overwrite = d.FindFirstChild("Speed") as IntValue | undefined;
            const inverted = (d.FindFirstChild("Inverted") as BoolValue | undefined)?.Value ?? false;
            const s = overwrite === undefined ? speed : overwrite.Value;
            d.AssemblyLinearVelocity = d.CFrame.LookVector.mul((inverted ? -1 : 1) * s);
            d.CustomPhysicalProperties = Conveyor.PHYSICAL_PROPERTIES;
            const beam = d.FindFirstChildOfClass("Beam");
            if (beam !== undefined) {
                beam.TextureSpeed = s / beam.TextureLength;
                beam.Enabled = item.beamEnabled !== false;
            }
        }
    }

    static readonly PHYSICAL_PROPERTIES = new PhysicalProperties(0.7, 0.3, 0.5);
    speed: number | undefined;
    beamEnabled: boolean | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("Conveyor");
        this.onLoad((model) => Conveyor.load(model, this));
    }

    enableBeam(enabled: boolean) {
        this.beamEnabled = enabled;
        return this;
    }

    setSpeed(speed: number) {
        this.speed = speed;
        return this;
    }
}

export = Conveyor;