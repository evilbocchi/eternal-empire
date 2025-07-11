import Item from "shared/item/Item";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

class Conveyor extends Item {

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
    
    speed: number | undefined;
    beamEnabled = true;

    constructor(id: string) {
        super(id);
        this.types.push("Conveyor");
        this.onLoad((model) => {
            const speed = this.getSpeed() ?? 1;
            const conveyors = findBaseParts(model, "Conveyor");
            for (const d of conveyors) {
                const overwrite = d.FindFirstChild("Speed") as IntValue | undefined;
                const inverted = (d.FindFirstChild("Inverted") as BoolValue | undefined)?.Value ?? false;
                const s = overwrite === undefined ? speed : overwrite.Value;
                d.Velocity = d.CFrame.LookVector.mul((inverted ? -1 : 1) * s);
                const beam = d.FindFirstChildOfClass("Beam");
                if (beam !== undefined) {
                    beam.TextureSpeed = s / beam.TextureLength;
                    beam.Enabled = this.beamEnabled;
                }
            }
        });
    }

    enableBeam(enabled: boolean) {
        this.beamEnabled = enabled;
        return this;
    }
    
    getSpeed() {
        return this.speed;
    }

    setSpeed(speed: number) {
        this.speed = speed;
        return this;
    }
}

export = Conveyor;