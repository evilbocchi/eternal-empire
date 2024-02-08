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