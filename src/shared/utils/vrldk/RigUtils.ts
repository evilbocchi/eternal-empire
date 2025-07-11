import { PathfindingService, RunService } from "@rbxts/services";

export function loadAnimation(humanoid: Humanoid, animationId: string | number): AnimationTrack | undefined {
    const animation = new Instance("Animation");
    const id = typeOf(animationId) === "number" ? ("rbxassetid://" + animationId) : animationId as string;
    animation.AnimationId = id;
    return humanoid.FindFirstChildOfClass("Animator")?.LoadAnimation(animation);
}

export function stopAllAnimations(humanoid: Humanoid) {
    const animator = humanoid.FindFirstChildOfClass("Animator");
    if (animator) {
        for (const track of animator.GetPlayingAnimationTracks()) {
            track.Stop();
            track.Destroy();
        }
    }
}

export function getNearestHumanoid(humanoids: Humanoid[], origin: Vector3): Humanoid | undefined {
	let nearestDist = 999;
	let nearestHumanoid = undefined as Humanoid | undefined;
	for (const humanoid of humanoids) {
		if (humanoid.RootPart) {
			const dist = humanoid.RootPart.Position.sub(origin).Magnitude;
			if (dist < nearestDist) {
				nearestDist = dist;
				nearestHumanoid = humanoid;
			}
		}
	}
	return nearestHumanoid;
}

export function getNearbyHumanoids(humanoids: Humanoid[], origin: Vector3, radius: number): Humanoid[] {
	/*
	const check = new Instance("Part");
	check.Shape = Enum.PartType.Ball;
	check.Position = origin;
	check.Size = new Vector3(radius * 2, radius * 2, radius * 2);
	check.Transparency = 0.5;
	check.Anchored = true;
	check.CanCollide = false;
	check.Parent = Workspace;
	Debris.AddItem(check, 1);
	*/
	const nearby: Humanoid[] = [];
	for (const humanoid of humanoids) {
		if (humanoid.RootPart && humanoid.RootPart.Position.sub(origin).Magnitude <= radius) {
			nearby.push(humanoid);
		}
	}
	return nearby;
}

export function pathfind(humanoid: Humanoid, position: Vector3, endCallback: () => unknown, iterations?: number) {
    if (iterations !== undefined && iterations <= 0) {
        return;
    }
	const rootPart = humanoid.RootPart!;
	const path = PathfindingService.CreatePath({
		Costs: {
			Water: 20,
			SmoothPlastic: 10,
			Wood: 10,
			Plastic: 2,
		},
		WaypointSpacing: 6
	});
	path.ComputeAsync(rootPart.Position, position);
	const waypoints = path.GetWaypoints();
	let i = 0;
	let newPos: Vector3;
	const doNextWaypoint = () => {
		++i;
		const nextWaypoint = waypoints[i];
		if (nextWaypoint !== undefined) {
			if (nextWaypoint.Action === Enum.PathWaypointAction.Jump) {
				humanoid.Jump = true;
				doNextWaypoint();
			}
			else if (nextWaypoint.Action === Enum.PathWaypointAction.Walk) {
				newPos = nextWaypoint.Position;
				humanoid.MoveTo(newPos);
			}
		}
		else {
			connection.Disconnect();
			endCallback();
		}
	}
	let t = 0;
	const connection = RunService.Heartbeat.Connect((dt) => {
		if (newPos === undefined)
			return;
		t += dt;
		if (rootPart.Position.sub(newPos).Magnitude < 5) {
			t = 0;
			doNextWaypoint();
		}
		else if (t > 2) {
			t = 0;
			connection.Disconnect();
			return pathfind(humanoid, position, endCallback);
		}
	});
	if (waypoints.isEmpty()) {
		warn("No path found");
        pathfind(humanoid, position.add(new Vector3(0, 1, 0)), endCallback, iterations === undefined ? 2 : iterations - 1);
		return;
	}
	doNextWaypoint();
}