import { isCompletelyInside, isInsidePart } from "shared/utils/vrldk/BasePartUtils";

class BuildBounds {
    grid: BasePart;
    region: BasePart;

    canvasCFrame: CFrame;
    canvasSize: Vector2;

    constructor(grid: BasePart) {
        this.grid = grid;
        const region = grid.Clone();
        region.Size = grid.Size.add(new Vector3(0.1, 50, 0.1));
        region.CanCollide = false;
        region.Transparency = 1;
        region.Name = "BuildRegion";
        this.region = region;
        [this.canvasCFrame, this.canvasSize] = this.calcCanvas();
    }

    calcCanvas(): [CFrame, Vector2] {
        const canvasSize = this.grid.Size;
        const back = new Vector3(0, -1, 0);
        const top = new Vector3(0, 0, -1);
        const right = new Vector3(-1, 0, 0);
        const cf = this.grid.CFrame.mul(CFrame.fromMatrix(back.mul(canvasSize.mul(-0.5)), right, top, back));
        const size = new Vector2(canvasSize.mul(right).Magnitude, canvasSize.mul(top).Magnitude);
        return [cf, size];
    }

    calcPlacementCFrame(model: Model, position: Vector3, rotation: number, noSnap?: boolean) {
        let modelSize = CFrame.fromEulerAnglesYXZ(0, rotation, 0).mul(model.PrimaryPart?.Size ?? new Vector3());
        modelSize = new Vector3(math.abs(modelSize.X), math.abs(modelSize.Y), math.abs(modelSize.Z));
        const lpos = this.canvasCFrame.PointToObjectSpace(position);
        const size2 = this.canvasSize.sub(new Vector2(modelSize.X, modelSize.Z)).div(2);
        let x = math.clamp(lpos.X, -size2.X, size2.X);
        let y = math.clamp(lpos.Y, -size2.Y, size2.Y);
        if (noSnap !== true) {
            x = math.sign(x) * ((math.abs(x) - math.abs(x) % 3) + (size2.X % 3));
            y = math.sign(y) * ((math.abs(y) - math.abs(y) % 3) + (size2.Y % 3));
        }
        return this.canvasCFrame.mul(new CFrame(x, y, -modelSize.Y/2).mul(CFrame.Angles(-math.pi/2, rotation, 0)));
    }

    isInside(position: Vector3) {
        return isInsidePart(position, this.region);
    }

    isCompletelyInside(hitbox: BasePart) {
        return isCompletelyInside(hitbox.CFrame, hitbox.Size, this.region);
    }

}

export = BuildBounds;