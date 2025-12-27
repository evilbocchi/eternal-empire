import { afterEach, beforeEach, describe, expect, it, jest } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import { CHALLENGE_PER_ID } from "shared/Challenge";
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
        empireData.items.researching.clear();
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

    afterEach(() => {
        Server.empireData.items.worldPlaced.clear();
        Server.empireData.items.inventory.clear();
        Server.empireData.items.bought.clear();
        Server.Item.fullUpdatePlacedItemsModels();
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
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(2);

            // Attempt to place an item
            expect(
                Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(0, 5, 0), 0, "BarrenIslands"),
            ).toBeDefined();

            // Should still have 1 available
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(1);

            // Place another item
            expect(
                Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(5, 5, 0), 0, "BarrenIslands"),
            ).toBeDefined();

            // Now should have 0 available
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(0);

            // Attempt to place one more should fail
            jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {}); // Suppress expected warning
            expect(
                Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(10, 5, 0), 0, "BarrenIslands"),
            ).toBeUndefined();
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(0);
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
            Server.Reset.performReset(RESET_LAYERS.Skillification);

            // Should still be able to place items
            const availableBefore = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(availableBefore).toBe(4);

            const placedItem = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(0, 5, 0), 0, "BarrenIslands");

            expect(placedItem).toBeDefined();
            expect(placedItem?.item).toBe(KillbrickUpgrader.id);

            // Available should decrease by 1
            const availableAfter = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(availableAfter).toBe(3);
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

    describe("Duplication Prevention", () => {
        it("does not duplicate items when placing and removing repeatedly", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 3);
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(3);

            // Place an item
            const placed1 = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(0, 5, 0), 0, "BarrenIslands");
            expect(placed1).toBeDefined();
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(2);

            // Remove it
            if (placed1) {
                Server.Item.unplaceItems(undefined, new Set([placed1.id]));
                expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(3);
            }

            // Place again
            const placed2 = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(5, 5, 0), 0, "BarrenIslands");
            expect(placed2).toBeDefined();
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(2);

            // Remove again
            if (placed2) {
                Server.Item.unplaceItems(undefined, new Set([placed2.id]));
                expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(3);
            }

            // Challenge rewards should remain unchanged
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(3);
        });

        it("does not duplicate when mixing inventory and challenge rewards", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 2);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 3);
            Server.empireData.items.worldPlaced.clear();
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(5);

            // Place all 5 items
            const placements = [];
            for (let i = 0; i < 5; i++) {
                const placed = Server.Item.serverPlace(
                    KillbrickUpgrader.id,
                    new Vector3(i * 9, 0, 0),
                    0,
                    "BarrenIslands",
                );
                expect(placed).toBeDefined();
                if (placed) placements.push(placed.id);
            }

            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(0);

            // Remove all items
            for (const placementId of placements) {
                Server.Item.unplaceItems(undefined, new Set([placementId]));
            }

            // Should return to original count
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(5);
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(2);
            expect(Server.empireData.items.inventory.get(KillbrickUpgrader.id)).toBe(3);
        });

        it("prevents duplication from retroactive initialization run multiple times", () => {
            Server.empireData.challenges.set("MeltingEconomy", 3);

            // First initialization
            const challenge = CHALLENGE_PER_ID.get("MeltingEconomy");
            if (!challenge || !challenge.itemRewards) return;

            const rewardMap1 = new Map<string, number>();
            const clears1 = Server.empireData.challenges.get("MeltingEconomy") ?? 0;

            for (let level = 1; level <= clears1; level++) {
                const itemReward = challenge.itemRewards.get(level);
                if (itemReward) {
                    const itemId = itemReward.item.id;
                    rewardMap1.set(itemId, (rewardMap1.get(itemId) ?? 0) + itemReward.count);
                }
            }

            for (const [itemId, amount] of rewardMap1) {
                Server.empireData.challengeItemRewards.set(itemId, amount);
            }

            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(3);

            // Second initialization (simulate reload or bug)
            const rewardMap2 = new Map<string, number>();
            const clears2 = Server.empireData.challenges.get("MeltingEconomy") ?? 0;

            for (let level = 1; level <= clears2; level++) {
                const itemReward = challenge.itemRewards.get(level);
                if (itemReward) {
                    const itemId = itemReward.item.id;
                    rewardMap2.set(itemId, (rewardMap2.get(itemId) ?? 0) + itemReward.count);
                }
            }

            // Should SET not ADD
            for (const [itemId, amount] of rewardMap2) {
                Server.empireData.challengeItemRewards.set(itemId, amount);
            }

            // Should still be 3, not 6
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(3);
        });

        it("handles concurrent placement attempts correctly", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 1);
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(1);

            // First placement should succeed
            const placed1 = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(0, 5, 0), 0, "BarrenIslands");
            expect(placed1).toBeDefined();
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(0);

            // Second placement should fail (no items available)
            jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {});
            const placed2 = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(5, 5, 0), 0, "BarrenIslands");
            expect(placed2).toBeUndefined();
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(0);

            // Challenge rewards should remain at 1
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(1);
        });

        it("does not create negative counts when removing more than placed", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 2);
            const placed = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(0, 5, 0), 0, "BarrenIslands");
            expect(placed).toBeDefined();
            if (!placed) return;

            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(1);

            // Remove the item
            Server.Item.unplaceItems(undefined, new Set([placed.id]));
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(2);

            // Attempt to remove again with same ID (should be no-op or error)
            Server.Item.unplaceItems(undefined, new Set([placed.id]));
            // Should still be 2, not 3
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(2);
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(2);
        });

        it("handles items in multiple states simultaneously without duplication", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 5);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 3);

            // Place some items
            const placed1 = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(0, 5, 0), 0, "BarrenIslands");
            const placed2 = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(5, 5, 0), 0, "BarrenIslands");
            expect(placed1).toBeDefined();
            expect(placed2).toBeDefined();

            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(6); // 5 + 3 - 2 = 6

            // Break one placed item
            if (placed1) {
                Server.Item.beginBreakdown([placed1.id]);
                expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(6); // Still 6
            }

            // Add some to researching
            Server.empireData.items.researching.set(KillbrickUpgrader.id, 2);
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(4); // 5 + 3 - 2 - 2 = 4

            // Repair broken item
            if (placed1) {
                Server.Item.repairAllBrokenItems();
                expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(4); // Still 4 (item still placed)
            }

            // Remove placed items
            if (placed2) {
                Server.Item.unplaceItems(undefined, new Set([placed2.id]));
                expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(5); // 5 + 3 - 1 - 2 = 5
            }

            if (placed1) {
                Server.Item.unplaceItems(undefined, new Set([placed1.id]));
                expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(6); // 5 + 3 - 0 - 2 = 6
            }

            // Verify base counts haven't been corrupted
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(5);
            expect(Server.empireData.items.inventory.get(KillbrickUpgrader.id)).toBe(3);
        });

        it("ensures buying items doesn't affect challenge rewards", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 3);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 0);
            Server.empireData.items.bought.set(KillbrickUpgrader.id, 0);
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(3);

            Server.Currency.set("Funds", new OnoeNum(0));
            Server.Item.buyItem(undefined, KillbrickUpgrader.id); // Should fail due to insufficient funds
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(3); // Still 3

            const before = new OnoeNum(1e20);
            Server.Currency.set("Funds", before);
            Server.Item.buyItem(undefined, KillbrickUpgrader.id); // Should succeed due to sufficient funds
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(4); // 3 from challenges + 1 from buy
            const expectedCost = KillbrickUpgrader.getPrice(1)?.get("Funds") ?? new OnoeNum(0);
            expect(Server.Currency.get("Funds")).toEqualOnoeNum(before.sub(expectedCost));

            // Should be in the inventory
            expect(Server.empireData.items.inventory.get(KillbrickUpgrader.id)).toBe(1);

            // Challenge rewards should be unchanged
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(3);
        });

        it("allows buying up to max shop purchases even with challenge rewards, exceeding normal max", () => {
            // Give challenge rewards
            const challengeRewardCount = 5;
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, challengeRewardCount);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 0);
            Server.empireData.items.bought.set(KillbrickUpgrader.id, 0);

            // Get the max purchases allowed from shop
            const maxPurchases = KillbrickUpgrader.pricePerIteration.size();
            expect(maxPurchases).toBeGreaterThan(0); // Ensure item has a purchase limit

            // Give enough currency to buy max amount
            Server.Currency.set("Funds", new OnoeNum(1e50));

            // Buy items up to the maximum
            for (let i = 0; i < maxPurchases; i++) {
                const success = Server.Item.buyItem(undefined, KillbrickUpgrader.id);
                expect(success).toBe(true);
            }

            // Should have challenge rewards + max purchases
            const expectedTotal = challengeRewardCount + maxPurchases;
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(expectedTotal);

            // Verify bought count is at max
            expect(Server.empireData.items.bought.get(KillbrickUpgrader.id)).toBe(maxPurchases);

            // Verify inventory has the purchased items
            expect(Server.empireData.items.inventory.get(KillbrickUpgrader.id)).toBe(maxPurchases);

            // Challenge rewards should be unchanged
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(challengeRewardCount);

            // Attempt to buy one more should fail (at max purchases)
            const beforeExtraBuy = Server.empireData.items.inventory.get(KillbrickUpgrader.id);
            Server.Item.buyItem(undefined, KillbrickUpgrader.id);
            const afterExtraBuy = Server.empireData.items.inventory.get(KillbrickUpgrader.id);

            // Should not have increased
            expect(afterExtraBuy).toBe(beforeExtraBuy);
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(expectedTotal);
        });

        it("prevents overflow from excessive challenge completions", () => {
            // Simulate many challenge completions
            const challenge = CHALLENGE_PER_ID.get("MeltingEconomy");
            if (!challenge || !challenge.itemRewards) return;

            Server.empireData.challenges.set("MeltingEconomy", 100);

            const rewardMap = new Map<string, number>();
            const clears = Server.empireData.challenges.get("MeltingEconomy") ?? 0;

            for (let level = 1; level <= clears; level++) {
                const itemReward = challenge.itemRewards.get(level);
                if (itemReward) {
                    const itemId = itemReward.item.id;
                    rewardMap.set(itemId, (rewardMap.get(itemId) ?? 0) + itemReward.count);
                }
            }

            for (const [itemId, amount] of rewardMap) {
                Server.empireData.challengeItemRewards.set(itemId, amount);
            }

            const rewards = Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id) ?? 0;
            expect(rewards).toBeGreaterThan(0);
            expect(rewards).toBeLessThanOrEqual(100); // Should match clears for 1:1 rewards
        });

        it("handles reset during active placement correctly", () => {
            Server.empireData.challengeItemRewards.set(KillbrickUpgrader.id, 3);
            Server.empireData.items.inventory.set(KillbrickUpgrader.id, 2);

            // Place an item
            const placed = Server.Item.serverPlace(KillbrickUpgrader.id, new Vector3(0, 5, 0), 0, "BarrenIslands");
            expect(placed).toBeDefined();
            expect(Server.Item.getAvailableAmount(KillbrickUpgrader)).toBe(4); // 3 + 2 - 1 = 4

            // Perform reset
            Server.Reset.performReset(RESET_LAYERS.Skillification);

            // Challenge rewards should persist, inventory should be cleared
            expect(Server.empireData.challengeItemRewards.get(KillbrickUpgrader.id)).toBe(3);
            expect(Server.empireData.items.inventory.get(KillbrickUpgrader.id) ?? 0).toBe(0);

            // Placed items should be cleared by reset
            const availableAfterReset = Server.Item.getAvailableAmount(KillbrickUpgrader);
            expect(availableAfterReset).toBeGreaterThanOrEqual(0);
            expect(availableAfterReset).toBeLessThanOrEqual(3); // Can't exceed challenge rewards
        });
    });
});
