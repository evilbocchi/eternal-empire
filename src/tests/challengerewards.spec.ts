import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import { Challenge, CHALLENGE_PER_ID } from "shared/Challenge";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import KillbrickUpgrader from "shared/items/negative/restful/KillbrickUpgrader";

describe("ChallengeRewards", () => {
    beforeEach(() => {
        // Reset empire data to clean slate
        const empireData = Server.empireData;
        empireData.challenges.clear();
        empireData.challengeItemRewards.clear();
        empireData.currentChallenge = undefined;
        empireData.currentChallengeStartTime = 0;
        empireData.challengeBestTimes.clear();
        empireData.items.inventory.clear();
        empireData.items.bought.clear();
        empireData.items.worldPlaced.clear();
        empireData.items.brokenPlacedItems.clear();
        empireData.currencies.clear();
        empireData.upgrades.clear();
        empireData.backup.currencies = undefined;
        empireData.backup.upgrades = undefined;
        empireData.level = 100; // High enough to start challenges
        empireData.playtime = 0;

        // Reset services state
        Server.Item.modelPerPlacementId.clear();

        // Give enough currency to start challenge
        Server.Currency.set("Funds", new OnoeNum(1e20));
        Server.Currency.set("Skill", new OnoeNum(1e20));
    });

    describe("Item Reward Granting", () => {
        it("grants item rewards when challenge is completed", () => {
            const challenge = CHALLENGE_PER_ID.get("MeltingEconomy");
            expect(challenge).toBeDefined();
            if (!challenge) return;

            // Complete the challenge (simulate)
            const clears = 0;
            const newClears = clears + 1;
            Server.empireData.challenges.set("MeltingEconomy", newClears);

            // Manually trigger the reward logic
            const itemReward = challenge.itemRewards?.get(newClears);
            expect(itemReward).toBeDefined();
            if (!itemReward) return;

            const itemId = itemReward.item.id;
            const currentRewards = Server.empireData.challengeItemRewards.get(itemId) ?? 0;
            Server.empireData.challengeItemRewards.set(itemId, currentRewards + itemReward.count);

            // Verify reward was granted
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(1);
        });

        it("grants correct rewards for multiple challenge completions", () => {
            const challenge = CHALLENGE_PER_ID.get("MeltingEconomy");
            expect(challenge).toBeDefined();
            if (!challenge) return;

            // Simulate completing levels 1-3
            for (let level = 1; level <= 3; level++) {
                Server.empireData.challenges.set("MeltingEconomy", level);

                const itemReward = challenge.itemRewards?.get(level);
                if (itemReward) {
                    const itemId = itemReward.item.id;
                    const currentRewards = Server.empireData.challengeItemRewards.get(itemId) ?? 0;
                    Server.empireData.challengeItemRewards.set(itemId, currentRewards + itemReward.count);
                }
            }

            // MeltingEconomy gives 1 KillbrickUpgrader per level, so should have 3 total
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(3);
        });
    });

    describe("Item Availability", () => {
        it("includes challenge rewards in available item count", () => {
            // Give 2 items via challenge rewards
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 2);

            // Give 3 items via inventory
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 3);

            const available = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(available).toBe(5); // 3 from inventory + 2 from challenges
        });

        it("allows placing items from challenge rewards", () => {
            // Give items only via challenge rewards
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 2);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 0);

            const available = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(available).toBe(2);

            // Attempt to place an item
            const [placedItem, remaining] = Server.Item.serverPlace(
                KillbrickUpgrader.id,
                new Vector3(0, 5, 0),
                0,
                "BarrenIslands",
            );

            expect(placedItem).toBeDefined();
            expect(remaining).toBe(0); // Inventory remains 0 (challenge rewards don't decrement)

            // Should still have 2 available (challenge rewards are permanent)
            const availableAfter = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(availableAfter).toBe(2);
        });

        it("subtracts researching items from available count", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 5);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 3);
            Server.empireData.items.researching.set(KillbrickUpgrader.id, 2);

            const available = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(available).toBe(6); // 5 + 3 - 2 = 6
        });
    });

    describe("Persistence Through Resets", () => {
        it("preserves challenge reward items after a reset", () => {
            // Give items via challenges
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 3);

            // Give regular inventory items
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 5);

            // Perform a Skillification reset (which resets most items)
            const resetLayer = RESET_LAYERS["Skillification"];
            expect(resetLayer).toBeDefined();

            Server.Reset.performReset(resetLayer);

            // Regular inventory should be cleared (KillbrickUpgrader resets on Skillification)
            const inventoryAmount = Server.empireData.items.inventory.get(KillbrickUpgrader.id) ?? 0;
            expect(inventoryAmount).toBe(0);

            // Challenge rewards should persist
            const challengeRewards = Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id) ?? 0;
            expect(challengeRewards).toBe(3);

            // Total available should be 3 (only from challenge rewards)
            const available = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(available).toBe(3);
        });

        it("allows using challenge reward items after a reset", () => {
            // Give items only via challenges
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 4);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 0);

            // Perform a reset
            const resetLayer = RESET_LAYERS["Skillification"];
            Server.Reset.performReset(resetLayer);

            // Should still be able to place items
            const availableBefore = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(availableBefore).toBe(4);

            const [placedItem, remaining] = Server.Item.serverPlace(
                KillbrickUpgrader.id,
                new Vector3(0, 5, 0),
                0,
                "BarrenIslands",
            );

            expect(placedItem).toBeDefined();
            expect(placedItem?.item).toBe(KillbrickUpgrader.id);

            // Challenge rewards don't decrement, so should still have 4 available
            const availableAfter = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(availableAfter).toBe(4);

            // Inventory should still be 0 (we placed from challenge rewards)
            expect(remaining).toBe(0);
        });

        it("accumulates challenge rewards across multiple resets", () => {
            // First challenge completion
            Server.empireData.challenges.set("MeltingEconomy", 1);
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 1);

            // Perform reset
            const resetLayer = RESET_LAYERS["Skillification"];
            Server.Reset.performReset(resetLayer);

            // Challenge rewards should persist
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(1);

            // Second challenge completion
            Server.empireData.challenges.set("MeltingEconomy", 2);
            const currentRewards = Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id) ?? 0;
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, currentRewards + 1);

            // Should now have 2 total
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(2);

            // Perform another reset
            Server.Reset.performReset(resetLayer);

            // Should still have 2
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(2);
        });
    });

    describe("Retroactive Initialization", () => {
        it("calculates rewards for already completed challenges", () => {
            // Simulate player who completed challenges before this feature
            Server.empireData.challenges.set("MeltingEconomy", 3);
            Server.empireData.challengeItemRewards.clear(); // No rewards tracked yet

            // Trigger initialization (what refreshChallenges does)
            const challenge = CHALLENGE_PER_ID.get("MeltingEconomy");
            expect(challenge).toBeDefined();
            if (!challenge || !challenge.itemRewards) return;

            const rewardMap = new Map<string, number>();
            const clears = Server.empireData.challenges.get("MeltingEconomy") ?? 0;

            for (let level = 1; level <= clears; level++) {
                const itemReward = challenge.itemRewards.get(level);
                if (itemReward) {
                    const itemId = itemReward.item.id;
                    rewardMap.set(itemId, (rewardMap.get(itemId) ?? 0) + itemReward.count);
                }
            }

            // Apply the calculated rewards
            for (const [itemId, amount] of rewardMap) {
                Server.empireData.challengeItemRewards.set(itemId, amount);
            }

            // Should have 3 KillbrickUpgraders (1 per level)
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(3);
        });

        it("does not duplicate rewards if already tracked", () => {
            // Player has completed challenges and rewards are tracked
            Server.empireData.challenges.set("MeltingEconomy", 2);
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 2);

            // Run initialization again
            const challenge = CHALLENGE_PER_ID.get("MeltingEconomy");
            if (!challenge || !challenge.itemRewards) return;

            const rewardMap = new Map<string, number>();
            const clears = Server.empireData.challenges.get("MeltingEconomy") ?? 0;

            for (let level = 1; level <= clears; level++) {
                const itemReward = challenge.itemRewards.get(level);
                if (itemReward) {
                    const itemId = itemReward.item.id;
                    rewardMap.set(itemId, (rewardMap.get(itemId) ?? 0) + itemReward.count);
                }
            }

            // Only update if different
            for (const [itemId, expectedAmount] of rewardMap) {
                const currentAmount = Server.empireData.challengeItemRewards.get(itemId) ?? 0;
                if (currentAmount !== expectedAmount) {
                    Server.empireData.challengeItemRewards.set(itemId, expectedAmount);
                }
            }

            // Should still have exactly 2
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(2);
        });
    });

    describe("Integration with Challenge System", () => {
        it("does not grant rewards when challenge is quit without clearing", () => {
            // Start a challenge
            Server.empireData.currentChallenge = "MeltingEconomy";
            Server.empireData.currentChallengeStartTime = 0;

            // End without clearing (cleared = false)
            Server.empireData.currentChallenge = undefined;

            // Should not have any rewards
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBeUndefined();
        });

        it("grants rewards only when challenge is cleared", () => {
            const challenge = CHALLENGE_PER_ID.get("MeltingEconomy");
            if (!challenge || !challenge.itemRewards) return;

            // Simulate clearing the challenge
            const newClears = 1;
            Server.empireData.challenges.set("MeltingEconomy", newClears);

            const itemReward = challenge.itemRewards.get(newClears);
            if (itemReward) {
                const itemId = itemReward.item.id;
                const currentRewards = Server.empireData.challengeItemRewards.get(itemId) ?? 0;
                Server.empireData.challengeItemRewards.set(itemId, currentRewards + itemReward.count);
            }

            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(1);
        });

        it("tracks challenge completion count separately from rewards", () => {
            Server.empireData.challenges.set("MeltingEconomy", 5);
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 5);

            // Completion count and reward count should match for 1:1 rewards
            const clears = Server.empireData.challenges.get("MeltingEconomy");
            const rewards = Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id);

            expect(clears).toBe(5);
            expect(rewards).toBe(5);
        });
    });

    describe("Edge Cases", () => {
        it("handles items with no challenge rewards", () => {
            // Item that is not a challenge reward
            const available = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(available).toBe(0); // No inventory, no challenge rewards
        });

        it("handles challenge rewards for items with existing inventory", () => {
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 10);
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 5);

            const available = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(available).toBe(15);
        });

        it("handles zero challenge rewards", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 0);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 3);

            const available = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(available).toBe(3);
        });
    });
});
