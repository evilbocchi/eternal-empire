import { Players } from "@rbxts/services";
import { getHumanoidsInArea } from "shared/utils/vrldk/BasePartUtils";
import { getNearbyHumanoids, getNearestHumanoid } from "shared/utils/vrldk/RigUtils";

export function getCharacter(player?: Player): Model | undefined {
	return player?.Character;
}

export function getHumanoid(player?: Player): Humanoid | undefined {
	return getCharacter(player)?.FindFirstChildOfClass("Humanoid");
}

export function getRootPart(player?: Player): BasePart | undefined {
	return getHumanoid(player)?.RootPart;
}
export function getAnimator(player?: Player): Animator | undefined {
	return getHumanoid(player)?.FindFirstChildOfClass("Animator");
}

export function getHealth(player?: Player): number {
	const humanoid = getHumanoid(player);
	return humanoid ? humanoid.Health : 0;
}

export function isDead(player?: Player): boolean {
	return getHealth(player) <= 0;
}

export function getAllPlayerHumanoids(): Humanoid[] {
	const humanoids: Humanoid[] = [];
	for (const player of Players.GetPlayers()) {
		const humanoid = getHumanoid(player);
		if (humanoid) {
			humanoids.push(humanoid);
		}
	}
	return humanoids;
}

export function getNearestPlayerHumanoid(origin: Vector3): Humanoid | undefined {
	return getNearestHumanoid(getAllPlayerHumanoids(), origin);
}

export function getNearbyPlayerHumanoids(origin: Vector3, radius: number): Humanoid[] {
	return getNearbyHumanoids(getAllPlayerHumanoids(), origin, radius);
}

export function getPlayerHumanoidsInArea(area: BasePart) {
	return getHumanoidsInArea(getAllPlayerHumanoids(), area);
}

export function isAllPlayersDead(): boolean {
	for (const player of Players.GetPlayers()) {
		if (!isDead(player)) {
			return false;
        }
    }
	return true;
}