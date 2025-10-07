/**
 * Upstream EToH falling platform script adapted for client-side use.
 * @param model The falling platform model
 * @returns A function to initialize the falling platform
 */
export default function createEtohFallingPlatform(model: Model) {
    const goldenmass = 4.8; // mass in cubic studs
    const setmaxforce = true;

    function setupPhysicalProperties(parent: BasePart) {
        const totalvolume = parent.Size.X * parent.Size.Y * parent.Size.Z;

        for (const v of parent.GetConnectedParts()) {
            if (v !== parent) {
                v.Massless = true;
            }
        }

        parent.CustomPhysicalProperties = new PhysicalProperties(
            (1 / totalvolume) * goldenmass,
            0.3, // friction
            0, // elasticity
            1, // friction weight
            100, // elasticity weight
        );

        const bodyPosition = parent.FindFirstChild("BodyPosition") as BodyPosition;
        if (bodyPosition) {
            bodyPosition.Position = parent.Position;
            bodyPosition.MaxForce = setmaxforce ? new Vector3(50000, 1000, 50000) : bodyPosition.MaxForce;
            bodyPosition.P = setmaxforce ? 2000 : bodyPosition.P;
        }

        parent.Position = parent.Position.sub(parent.CFrame.UpVector.mul(2));
        parent.Anchored = false;

        task.spawn(() => {
            if (bodyPosition) {
                const oldforce = bodyPosition.MaxForce;
                const oldp = bodyPosition.P;

                bodyPosition.MaxForce = new Vector3(math.huge, 5000, math.huge);
                bodyPosition.P = 2000;
                wait(0.5);
                bodyPosition.MaxForce = oldforce;
                bodyPosition.P = oldp;
            }
        });
    }

    function setupBounce(parent: BasePart) {
        parent.CanCollide = false;
        let bounce = false;

        parent.Touched.Connect((hit) => {
            const platform = parent.Parent?.FindFirstChild("Platform") as BasePart | undefined;
            if (hit === platform && !bounce) {
                bounce = true;
                platform.CanCollide = false;
                platform.Transparency = 0.8;

                const bodyPosition = platform.FindFirstChild("BodyPosition") as BodyPosition;
                if (bodyPosition) {
                    const oldforce = bodyPosition.MaxForce;
                    const oldp = bodyPosition.P;

                    bodyPosition.MaxForce = new Vector3(math.huge, 5000, math.huge);
                    bodyPosition.P = 2000;

                    wait(1.5);

                    platform.CanCollide = true;
                    platform.Transparency = 0;

                    bodyPosition.MaxForce = oldforce;
                    bodyPosition.P = oldp;
                }
                bounce = false;
            }
        });
    }

    return () => {
        const platform = model.FindFirstChild("Platform") as BasePart | undefined;
        if (platform) {
            setupPhysicalProperties(platform);
        }

        const endPart = model.FindFirstChild("End") as BasePart | undefined;
        if (endPart) {
            setupBounce(endPart);
        }
    };
}
