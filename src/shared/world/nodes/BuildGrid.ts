import { TweenService } from "@rbxts/services";
import WorldNode from "shared/world/nodes/WorldNode";

class BuildGrid extends WorldNode {
    readonly TRANSPARENCY_TWEENINFO = new TweenInfo(0.3, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out);

    constructor() {
        super(script.Name);
    }

    setTransparency(transparency: number) {
        for (const grid of this.INSTANCES) {
            const texture = grid.FindFirstChildOfClass("Texture");
            if (texture === undefined) continue;
            TweenService.Create(texture, this.TRANSPARENCY_TWEENINFO, { Transparency: transparency }).Play();
        }
    }
}

export = new BuildGrid();
