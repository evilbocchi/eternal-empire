import { PathfindingService, Workspace } from "@rbxts/services";
import { ASSETS } from "shared/asset/GameAssets";

declare global {
    interface Assets {
        Wanderers: Folder;
    }
}

function unstuck(character: Model) {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    humanoid.Move(new Vector3(math.random(-1, 1), 0, math.random(-1, 1)));
    humanoid.Jump = true;
    task.wait(0.5);
}

function getPathingFactory(character: Model) {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    const rootPart = humanoid.RootPart ?? (character.WaitForChild("HumanoidRootPart") as BasePart);

    let pathCount = 0;

    const pathToLocation = (location: Vector3) => {
        const path = PathfindingService.CreatePath();
        path.ComputeAsync(rootPart.Position, location);
        pathCount += 1;

        if (path.Status === Enum.PathStatus.Success) {
            const currentPathCount = pathCount;
            for (const waypoint of path.GetWaypoints()) {
                if (currentPathCount !== pathCount) {
                    return; // Path was recalculated, exit early
                }
                if (waypoint.Action === Enum.PathWaypointAction.Jump) {
                    humanoid.Jump = true;
                }
                humanoid.MoveTo(waypoint.Position);
                task.delay(0.5, () => {
                    if (humanoid.WalkToPoint.Y > rootPart.Position.Y) {
                        humanoid.Jump = true;
                    }
                });
                const moveSucccess = humanoid.MoveToFinished.Wait();
                if (!moveSucccess) {
                    break;
                }
            }
        } else if (path.Status === Enum.PathStatus.NoPath || path.Status === Enum.PathStatus.ClosestNoPath) {
            return;
        } else {
            unstuck(character);
        }
    };

    return pathToLocation;
}

function loadWanderer(character: Model) {
    for (const child of character.GetChildren()) {
        if (child.IsA("BasePart")) {
            child.CollisionGroup = "NPC";
        }
    }

    const pathToLocation = getPathingFactory(character);
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    const rootPart = humanoid.RootPart ?? (character.WaitForChild("HumanoidRootPart") as BasePart);

    const wander = () => {
        let randX = math.random(-60, 60);
        randX += math.sign(randX) * 10; // Ensure it's not too close to zero
        let randZ = math.random(-60, 60);
        randZ += math.sign(randZ) * 10;
        const goal = rootPart.Position.add(new Vector3(randX, 0, randZ));
        pathToLocation(goal);
    };

    task.spawn(() => {
        while (task.wait()) {
            wander();
            task.wait(math.random(30, 60)); // Make this massive to avoid performance issues
        }
    });
}

const enabled = false;
for (const startPos of Workspace.WaitForChild("Wanderers").GetChildren()) {
    if (!startPos.IsA("BasePart")) continue;

    startPos.Transparency = 1;
    if (!enabled) {
        continue; // Skip loading wanderers if not enabled
    }

    const name = startPos.Name;
    const character = ASSETS.Wanderers.WaitForChild(name).Clone() as Model;
    const animateScript = character.FindFirstChild("Animate") as Script | undefined;

    character.PivotTo(startPos.CFrame);
    character.Parent = Workspace;
    loadWanderer(character);
    if (animateScript !== undefined) {
        animateScript.Enabled = true;
    }

    startPos.Destroy();
}
