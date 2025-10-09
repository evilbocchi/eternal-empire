import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import TierDifficulty from "shared/difficulty/TierDifficulty";
import Item from "shared/item/Item";

namespace DifficultyResearch {
    export function isResearchEligible(item: Item) {
        if (item.isA("Unique")) return false;
        if (item.isA("Gear")) return false;
        if (item.isA("Shop")) return false;
        if (item.id === "DifficultyResearcher") return false; // Self-reference
        const difficulty = item.difficulty;
        if (difficulty === Difficulty.Bonuses || difficulty === Difficulty.Excavation) return false;
        return true;
    }

    export function collectUniqueDifficulties() {
        const unique = new Set<string>();
        const sorted = new Array<Difficulty>();
        for (const item of Server.Items.sortedItems) {
            const difficulty = item.difficulty;
            if (difficulty.class === -99 || difficulty === Difficulty.Bonuses || difficulty === Difficulty.Excavation)
                continue;
            if (TierDifficulty.TIERS.has(difficulty)) continue;
            if (unique.has(difficulty.id)) continue;
            unique.add(difficulty.id);
            sorted.push(difficulty);
        }
        sorted.sort((a, b) => (a.layoutRating ?? 0) < (b.layoutRating ?? 0));
        return sorted;
    }

    export function getDifficultyRequirement(index: number) {
        if (index <= 0) {
            return new OnoeNum(1);
        }

        if (index % 2 === 1) {
            return OnoeNum.fromSerika(64, index - 1);
        }

        return OnoeNum.fromSerika(1, index + 1);
    }

    /**
     * Builds a map of difficulty ID to research requirement based on the provided difficulties.
     * @param difficulties The array of unique difficulties to build requirements for.
     * @returns A map where the key is the difficulty ID and the value is the research requirement as an OnoeNum.
     */
    export function buildDifficultyRequirements(difficulties: Difficulty[]) {
        const requirements = new Map<string, OnoeNum>();
        difficulties.forEach((difficulty, index) => {
            requirements.set(difficulty.id, getDifficultyRequirement(index));
        });
        return requirements;
    }
}

export default DifficultyResearch;
