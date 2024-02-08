import { TweenService } from "@rbxts/services";

export function weld(part0: BasePart, part1: BasePart) {
	const w = new Instance("ManualWeld", part0);
	w.Name = part0.Name + "_Weld_" + part1.Name;
	w.C0 = part0.CFrame.Inverse().mul(part1.CFrame);
	w.Part0 = part0;
	w.Part1 = part1;
	return w;
}

export function weldParts(parts: Instance[], primary: BasePart) {
	for (const part of parts) {
		if (part.IsA("BasePart") && part !== primary) {
			const weld = new Instance("WeldConstraint");
			weld.Enabled = true;
			weld.Part0 = part;
			weld.Part1 = primary;
			weld.Parent = part;
			part.Anchored = false;
		}
	}
}

export function weldModel(model: Model) {
	if (model.PrimaryPart !== undefined) {
		weldParts(model.GetDescendants(), model.PrimaryPart);
		return model.PrimaryPart;
	}
	else {
		error("No PrimaryPart found for model " + model.Name);
	}
}

export function rainbowEffect(basePart: BasePart, dur: number) {
	const t1 = TweenService.Create(basePart, new TweenInfo(dur), {Color: new Color3(1, 0, 0)});
	const t2 = TweenService.Create(basePart, new TweenInfo(dur), {Color: new Color3(1, 1, 0)});
	const t3 = TweenService.Create(basePart, new TweenInfo(dur), {Color: new Color3(0, 1, 0)});
	const t4 = TweenService.Create(basePart, new TweenInfo(dur), {Color: new Color3(0, 1, 1)});
	const t5 = TweenService.Create(basePart, new TweenInfo(dur), {Color: new Color3(0, 0, 1)});
	const t6 = TweenService.Create(basePart, new TweenInfo(dur), {Color: new Color3(1, 0, 1)});
	const c1 = t1.Completed.Connect(() => t2.Play());
	const c2 = t2.Completed.Connect(() => t3.Play());
	const c3 = t3.Completed.Connect(() => t4.Play());
	const c4 = t4.Completed.Connect(() => t5.Play());
	const c5 = t5.Completed.Connect(() => t6.Play());
	const c6 = t6.Completed.Connect(() => t1.Play());
	t1.Play();
	basePart.Destroying.Once(() => {
		c1.Disconnect();
		c2.Disconnect();
		c3.Disconnect();
		c4.Disconnect();
		c5.Disconnect();
		c6.Disconnect();
	});
}

export function revertSurfaces(part: Part) {
	part.TopSurface = Enum.SurfaceType.Studs;
	part.BottomSurface = Enum.SurfaceType.Studs;
	part.LeftSurface = Enum.SurfaceType.Studs;
	part.RightSurface = Enum.SurfaceType.Studs;
	part.FrontSurface = Enum.SurfaceType.Studs;
	part.BackSurface = Enum.SurfaceType.Studs;
}

export function isInsidePart(position: Vector3, part: BasePart) {
	const v3 = part.CFrame.PointToObjectSpace(position);
	const size = part.Size;
	return (math.abs(v3.X) <= size.X / 2) && (math.abs(v3.Y) <= size.Y / 2) && (math.abs(v3.Z) <= size.Z / 2);
}

export function isCompletelyInside(cframe: CFrame, size: Vector3, part: BasePart) {
	size = size.div(2);
	const corners = [
		cframe.mul(new CFrame(size.X, size.Y, size.Z)),
		cframe.mul(new CFrame(size.X, size.Y, -size.Z)),
		cframe.mul(new CFrame(size.X, -size.Y, size.Z)),
		cframe.mul(new CFrame(size.X, -size.Y, -size.Z)),
		cframe.mul(new CFrame(-size.X, size.Y, size.Z)),
		cframe.mul(new CFrame(-size.X, size.Y, -size.Z)),
		cframe.mul(new CFrame(-size.X, -size.Y, size.Z)),
		cframe.mul(new CFrame(-size.X, -size.Y, -size.Z))
	];
	for (const cf of corners) {
		if (!isInsidePart(cf.Position, part))
			return false;
	}
	return true;
}

export function findBaseParts(instance: Instance, name: string): BasePart[] {
	return instance.GetDescendants().filter((v) => v.Name === name && v.IsA("BasePart")) as BasePart[];
}

export function playSoundAtPart(basePart: BasePart | undefined, sound: Sound | string | number, volume?: number) {
	if (basePart) {
		if (typeOf(sound) === "Instance") {
			const soundInstance = (sound as Sound).Clone();
			soundInstance.Parent = basePart;
			soundInstance.Name = "sound" + (sound as Sound).SoundId;
			if (volume) {
				soundInstance.Volume = volume;
			}
			soundInstance.Play();
			return;
		}

		const id = typeOf(sound) === "string" ? sound as string : "rbxassetid://" + tostring(sound);
		const cacheSoundInstance = basePart.FindFirstChild("sound" + id);
		if (cacheSoundInstance && cacheSoundInstance.IsA("Sound")) {
			if (volume) {
				cacheSoundInstance.Volume = volume;
			}
			cacheSoundInstance.Play();
			return;
		}
		const soundInstance = new Instance("Sound");
		soundInstance.Name = "sound" + id;
		soundInstance.SoundId = id;
		soundInstance.Parent = basePart;
		if (volume) {
			soundInstance.Volume = volume;
		}
		soundInstance.Play();
	}
}

export function addTouchInterest(basePart: BasePart): TouchTransmitter | undefined {
	basePart.Touched.Connect(() => { });
	return basePart.FindFirstChildOfClass("TouchTransmitter");
}

export function getHumanoidsInArea(humanoids: Humanoid[], area: BasePart) {
	area.Touched.Connect(() => {});
	const inArea: Humanoid[] = [];
	for (const otherPart of area.GetTouchingParts()) {
		if (otherPart.Parent) {
			const humanoid = otherPart.Parent.FindFirstChildOfClass("Humanoid");
			if (humanoid && humanoids.includes(humanoid)) {
				inArea.push(humanoid);
			}
		}
	}
	return inArea;
}

export function getWorldSize(part: BasePart) {
	const c = part.CFrame.VectorToWorldSpace(part.Size);
	return new Vector3(math.abs(c.X), math.abs(c.Y), math.abs(c.Z));
}