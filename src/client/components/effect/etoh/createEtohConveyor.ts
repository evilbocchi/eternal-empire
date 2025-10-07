/**
 * Upstream EToH conveyor script adapted for client-side use.
 * @param model The conveyor model
 * @returns A function to initialize the conveyor
 */
export default function createEtohConveyor(conveyor: BasePart) {
    return () => {
        conveyor.FrontSurface = Enum.SurfaceType.Studs;
        const speed = (conveyor.FindFirstChild("Speed") as NumberValue | undefined)?.Value ?? 1;
        conveyor.AssemblyLinearVelocity = conveyor.CFrame.LookVector.mul(speed);
        for (const c of conveyor.GetChildren()) {
            if (!c.IsA("Attachment")) continue;
            const beam = new Instance("Beam");
            beam.TextureSpeed = speed / beam.TextureLength;
        }
    };
}
