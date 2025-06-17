import { Controller, OnInit } from "@flamework/core";
import { PathfindingService, Workspace } from "@rbxts/services";
import { UIController } from "client/controllers/UIController";
import { ASSETS } from "shared/GameAssets";

declare global {
    interface Assets {
        Wanderers: Folder;
    }
}

@Controller()
export class WandererController implements OnInit {

    constructor(private uiController: UIController) {
    }

    unstuck(character: Model) {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        humanoid.Move(new Vector3(math.random(-1, 1), 0, math.random(-1, 1)));
        humanoid.Jump = true;
        task.wait(0.5);
    }

    getPathingFactory(character: Model) {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        const rootPart = humanoid.RootPart ?? character.WaitForChild("HumanoidRootPart") as BasePart;

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
            }
            else {
                this.unstuck(character);
            }
        };

        return pathToLocation;
    }

    loadWanderer(character: Model) {
        const pathToLocation = this.getPathingFactory(character);
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        const rootPart = humanoid.RootPart ?? character.WaitForChild("HumanoidRootPart") as BasePart;

        const wander = () => {
            let randX = math.random(-100, 100);
            randX += math.sign(randX) * 10; // Ensure it's not too close to zero
            let randZ = math.random(-100, 100);
            randZ += math.sign(randZ) * 10;
            const goal = rootPart.Position.add(new Vector3(randX, 0, randZ));
            pathToLocation(goal);
        };

        task.spawn(() => {
            while (task.wait()) {
                task.wait(math.random(15, 30)); // Make this massive to avoid performance issues
                wander();
            }
        });
    }

    onInit() {
        for (const startPos of Workspace.WaitForChild("Wanderers").GetChildren()) {
            if (!startPos.IsA("BasePart"))
                continue;

            const name = startPos.Name;
            const character = ASSETS.Wanderers.WaitForChild(name).Clone() as Model;
            const animateScript = character.FindFirstChild("Animate") as Script | undefined;

            character.PivotTo(startPos.CFrame);
            character.Parent = Workspace;
            this.loadWanderer(character);
            if (animateScript !== undefined) {
                animateScript.Enabled = true;
            }

            startPos.Destroy();
        }
    }
}