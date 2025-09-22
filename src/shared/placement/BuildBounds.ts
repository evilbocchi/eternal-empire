//!native
//!optimize 2

import { isCompletelyInside, isInsidePart } from "@antivivi/vrldk";
import eat from "shared/hamster/eat";

/**
 * Represents the bounds of a build area.
 */
class BuildBounds {
    /**
     * The grid of the build area. This is the part that the player can build on.
     * Objects that are placed on this part should be directly above it.
     */
    grid?: BasePart;

    /**
     * Represents the region that the player can build in.
     * Used for checking if a part is inside the build area.
     */
    private region?: BasePart;

    private sizeConnection?: RBXScriptConnection;

    /**
     * The CFrame of the canvas.
     */
    canvasCFrame?: CFrame;

    /**
     * The Y position of the canvas.
     */
    canvasAltitude?: number;

    /**
     * The size of the canvas in 2D space, excluding the Y axis.
     */
    canvasSize?: Vector2;

    constructor(part?: BasePart) {
        if (part !== undefined) this.draw(part);
        eat(() => {
            this.sizeConnection?.Disconnect();
        });
    }

    /**
     * Constructs properties for the build area.
     *
     * @param grid The grid of the build area.
     */
    draw(grid: BasePart) {
        this.grid = grid;
        const onSizeChanged = () => {
            if (grid === undefined) {
                return;
            }
            const region = grid.Clone();
            region.Size = grid.Size.add(new Vector3(0.1, 150, 0.1));
            region.CanCollide = false;
            region.Transparency = 1;
            region.Name = "BuildRegion";
            this.region = region;

            const gridSize = grid.Size;
            const back = new Vector3(0, -1, 0);
            const top = new Vector3(0, 0, -1);
            const right = new Vector3(-1, 0, 0);
            const canvasCFrame = grid.CFrame.mul(CFrame.fromMatrix(back.mul(gridSize.mul(-0.5)), right, top, back));
            const canvasSize = new Vector2(gridSize.mul(right).Magnitude, gridSize.mul(top).Magnitude);

            if (canvasCFrame !== undefined) {
                this.canvasCFrame = canvasCFrame;
                this.canvasSize = canvasSize;
                this.canvasAltitude = canvasCFrame.Y;
            }
        };
        this.sizeConnection?.Disconnect();
        this.sizeConnection = grid.GetPropertyChangedSignal("Size").Connect(onSizeChanged);
        onSizeChanged();
        return grid;
    }

    /**
     * Converts the position of a part to a position that is snapped to the grid.
     * The converted position is relative to the grid.
     *
     * @param size Size of the part.
     * @param position Position of the part.
     * @param rotation Rotation of the part. This is in radians.
     * @param noSnap Whether to snap the part to the grid.
     * @returns The snapped position.
     */
    snap(size: Vector3, position: Vector3, rotation: number, noSnap?: boolean) {
        const canvasCFrame = this.canvasCFrame;
        if (canvasCFrame === undefined) return;

        const modelSize = CFrame.fromEulerAnglesYXZ(0, rotation, 0).mul(size);
        const modelSizeX = math.abs(modelSize.X);
        const modelSizeY = math.abs(modelSize.Y);
        const modelSizeZ = math.abs(modelSize.Z);
        const lpos = canvasCFrame.PointToObjectSpace(position);
        const size2 = this.canvasSize!.sub(new Vector2(modelSizeX, modelSizeZ)).div(2);
        let x: number;
        let y: number;
        let altOffset = -modelSizeY / 2;
        const isUnbounded = math.abs(lpos.X) > size2.X + 10 || math.abs(lpos.Y) > size2.Y + 10;
        if (isUnbounded) {
            x = lpos.X;
            y = lpos.Y;
            altOffset += this.canvasAltitude! - position.Y;
        } else {
            x = math.clamp(lpos.X, -size2.X, size2.X);
            y = math.clamp(lpos.Y, -size2.Y, size2.Y);

            if (noSnap !== true) {
                const xOffset = size2.X % 3;
                const yOffset = size2.Y % 3;
                x = math.sign(x) * (math.round((math.abs(x) - xOffset) / 3) * 3 + xOffset);
                y = math.sign(y) * (math.round((math.abs(y) - yOffset) / 3) * 3 + yOffset);
            }
        }

        return canvasCFrame.mul(new CFrame(x, y, altOffset).mul(CFrame.Angles(-math.pi / 2, rotation, 0)));
    }

    isInside(position: Vector3) {
        return isInsidePart(position, this.region);
    }

    isCompletelyInside(hitbox: BasePart) {
        return isCompletelyInside(hitbox.CFrame, hitbox.Size, this.region);
    }
}

export = BuildBounds;
