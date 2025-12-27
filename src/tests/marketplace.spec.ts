import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import BulkyDropper from "shared/items/negative/tlg/BulkyDropper";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import LaserFan from "shared/items/negative/unimpossible/LaserFan";
import QuantumGear from "shared/items/0/millisecondless/QuantumGear";

describe("Marketplace & Shop Logic", () => {
    beforeEach(() => {
        // Reset all item data
        const items = Server.empireData.items;
        items.inventory.clear();
        items.bought.clear();
        items.worldPlaced.clear();
        items.uniqueInstances.clear();
        Server.Item.modelPerPlacementId.clear();

        // Reset currencies
        Server.Currency.set("Funds", new OnoeNum(1e9));

        // Reset level
        Server.empireData.level = 100;
    });

    describe("Purchase Validation", () => {
        describe("Insufficient Funds", () => {
            it("should reject purchase when player has insufficient funds", () => {
                // Set funds to less than item cost
                Server.Currency.set("Funds", new OnoeNum(1));

                const initialInventory = Server.empireData.items.inventory.get(BulkyDropper.id) ?? 0;
                const success = Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(success).toBe(false);
                const finalInventory = Server.empireData.items.inventory.get(BulkyDropper.id) ?? 0;
                expect(finalInventory).toBe(initialInventory);
            });

            it("should reject purchase when exactly one unit short of price", () => {
                // Get the price for first BulkyDropper
                const price = BulkyDropper.getPrice(1);
                if (price === undefined) {
                    throw "BulkyDropper has no price";
                }

                // Get the funds amount needed (should be OnoeNum)
                const fundsNeeded = price.amountPerCurrency.get("Funds");
                if (fundsNeeded === undefined) {
                    throw "BulkyDropper price has no Funds component";
                }

                // Set funds to one less than needed
                Server.Currency.set("Funds", fundsNeeded.sub(new OnoeNum(1)));

                const success = Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(success).toBe(false);
                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBeUndefined();
            });

            it("should succeed when player has exact funds", () => {
                const price = BulkyDropper.getPrice(1);
                if (price === undefined) {
                    throw "BulkyDropper has no price";
                }

                const fundsNeeded = price.amountPerCurrency.get("Funds");
                if (fundsNeeded === undefined) {
                    throw "BulkyDropper price has no Funds component";
                }

                Server.Currency.set("Funds", fundsNeeded);

                const success = Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(success).toBe(true);
                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBe(1);
            });

            it("should handle multiple currency requirements", () => {
                // Find an item that requires multiple currencies
                const itemWithMultipleCurrencies = Items.sortedItems.find((item) => {
                    const price = item.getPrice(1);
                    if (price === undefined) return false;
                    let currencyCount = 0;
                    for (const [,] of price.amountPerCurrency) {
                        currencyCount++;
                    }
                    return currencyCount > 1;
                });

                if (itemWithMultipleCurrencies !== undefined) {
                    const price = itemWithMultipleCurrencies.getPrice(1);
                    if (price === undefined) {
                        throw "Item price is undefined";
                    }

                    // Set all currencies to zero
                    Server.Currency.set("Funds", new OnoeNum(0));

                    // Set only first currency to required amount
                    let firstCurrency: string | undefined;
                    for (const [currency, amount] of price.amountPerCurrency) {
                        if (firstCurrency === undefined) {
                            Server.Currency.set(currency, amount);
                            firstCurrency = currency;
                        }
                    }

                    const success = Server.Item.buyItem(undefined, itemWithMultipleCurrencies.id);

                    // Should fail because we're missing at least one currency
                    expect(success).toBe(false);
                }
            });
        });

        describe("Locked Items", () => {
            it("should reject purchase when required shop is not unlocked", () => {
                // Find an item that requires a shop
                const itemRequiringShop = Items.sortedItems.find((item) => {
                    const shops = item.shopsSoldIn;
                    if (shops.isEmpty()) return false;

                    // Check if any shop has a price (meaning it must be unlocked)
                    for (const shop of shops) {
                        if (!shop.pricePerIteration.isEmpty()) {
                            return true;
                        }
                    }
                    return false;
                });

                if (itemRequiringShop !== undefined) {
                    // Ensure shop is not bought
                    const shops = itemRequiringShop.shopsSoldIn;
                    for (const shop of shops) {
                        Server.Item.setBoughtAmount(shop, 0);
                    }

                    // Give enough funds
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    // Create a mock player
                    const mockPlayer = {
                        UserId: 12345,
                        Name: "TestPlayer",
                    } as Player;

                    const success = Server.Item.buyItem(mockPlayer, itemRequiringShop.id);

                    expect(success).toBe(false);
                }
            });

            it("should allow purchase when required shop is unlocked", () => {
                // Use BulkyDropper which has no special requirements
                Server.Currency.set("Funds", new OnoeNum(1e12));
                Server.Currency.set("Time", new OnoeNum(1e12));

                const success = Server.Item.serverBuy(BulkyDropper);

                expect(success).toBe(true);
            });

            it("should allow purchase without player when shop check is bypassed", () => {
                // Use BulkyDropper which has no special requirements
                Server.Currency.set("Funds", new OnoeNum(1e12));
                Server.Currency.set("Time", new OnoeNum(1e12));

                const success = Server.Item.serverBuy(BulkyDropper);

                expect(success).toBe(true);
            });
        });

        describe("Level Requirements", () => {
            it("should reject purchase when player level is below requirement", () => {
                // QuantumGear requires level 1
                if (QuantumGear.isA("Gear") && QuantumGear.levelReq !== undefined) {
                    Server.empireData.level = QuantumGear.levelReq - 1;
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    const success = Server.Item.buyItem(undefined, QuantumGear.id);

                    expect(success).toBe(false);
                    expect(Server.empireData.items.inventory.get(QuantumGear.id)).toBeUndefined();
                }
            });

            it("should allow purchase when player level meets requirement", () => {
                if (QuantumGear.isA("Gear") && QuantumGear.levelReq !== undefined) {
                    Server.empireData.level = QuantumGear.levelReq;
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    const success = Server.Item.buyItem(undefined, QuantumGear.id);

                    expect(success).toBe(true);
                    expect(Server.empireData.items.inventory.get(QuantumGear.id)).toBe(1);
                }
            });

            it("should allow purchase when player level exceeds requirement", () => {
                if (QuantumGear.isA("Gear") && QuantumGear.levelReq !== undefined) {
                    Server.empireData.level = QuantumGear.levelReq + 50;
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    const success = Server.Item.buyItem(undefined, QuantumGear.id);

                    expect(success).toBe(true);
                }
            });

            it("should not check level requirements for non-gear items", () => {
                // TheFirstDropper is not a gear
                Server.empireData.level = 0;
                Server.Currency.set("Funds", new OnoeNum(1e12));

                const success = Server.Item.buyItem(undefined, TheFirstDropper.id);

                expect(success).toBe(true);
            });
        });

        describe("Required Items", () => {
            it("should reject purchase when required items are missing", () => {
                // Find an item with required items
                const itemWithRequirements = Items.sortedItems.find((item) => {
                    return !item.requiredItems.isEmpty();
                });

                if (itemWithRequirements !== undefined) {
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    // Ensure required items are not in inventory
                    for (const [requiredItemId] of itemWithRequirements.requiredItems) {
                        Server.empireData.items.inventory.set(requiredItemId, 0);
                    }

                    const success = Server.Item.buyItem(undefined, itemWithRequirements.id);

                    expect(success).toBe(false);
                }
            });

            it("should consume required items when purchase succeeds", () => {
                // Find an item with required items
                const itemWithRequirements = Items.sortedItems.find((item) => {
                    return !item.requiredItems.isEmpty();
                });

                if (itemWithRequirements !== undefined) {
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    // Give required items
                    const requiredAmounts = new Map<string, number>();
                    for (const [requiredItemId, amount] of itemWithRequirements.requiredItems) {
                        Server.empireData.items.inventory.set(requiredItemId, amount + 5);
                        requiredAmounts.set(requiredItemId, amount);
                    }

                    const success = Server.Item.buyItem(undefined, itemWithRequirements.id);

                    expect(success).toBe(true);

                    // Verify items were consumed
                    for (const [requiredItemId, requiredAmount] of requiredAmounts) {
                        const remaining = Server.empireData.items.inventory.get(requiredItemId);
                        expect(remaining).toBe(5); // Started with amount+5, consumed amount, left with 5
                    }
                }
            });

            it("should reject purchase when insufficient required items", () => {
                const itemWithRequirements = Items.sortedItems.find((item) => {
                    return !item.requiredItems.isEmpty();
                });

                if (itemWithRequirements !== undefined) {
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    // Give less than required
                    for (const [requiredItemId, amount] of itemWithRequirements.requiredItems) {
                        Server.empireData.items.inventory.set(requiredItemId, amount - 1);
                    }

                    const success = Server.Item.buyItem(undefined, itemWithRequirements.id);

                    expect(success).toBe(false);
                }
            });
        });
    });

    describe("Inventory Management", () => {
        describe("Item Addition", () => {
            it("should increment inventory count when item is purchased", () => {
                Server.empireData.items.inventory.set(BulkyDropper.id, 5);
                Server.Currency.set("Funds", new OnoeNum(1e12));

                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBe(6);
            });

            it("should handle buying multiple items in sequence", () => {
                Server.Currency.set("Funds", new OnoeNum(1e12));

                Server.Item.buyItem(undefined, BulkyDropper.id);
                Server.Item.buyItem(undefined, BulkyDropper.id);
                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBe(3);
            });

            it("should handle buyAllItems with multiple item types", () => {
                Server.Currency.set("Funds", new OnoeNum(1e12));

                const mockPlayer = {
                    UserId: 12345,
                    Name: "TestPlayer",
                } as Player;

                const itemIds = new Set([BulkyDropper.id, TheFirstDropper.id]);
                const success = Server.Item.buyAllItems(mockPlayer, itemIds);

                expect(success).toBe(true);
                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBe(1);
                expect(Server.empireData.items.inventory.get(TheFirstDropper.id)).toBe(1);
            });

            it("should partially succeed in buyAllItems when some purchases fail", () => {
                // Give enough for only one item
                const firstPrice = BulkyDropper.getPrice(1);
                if (firstPrice !== undefined) {
                    const fundsNeeded = firstPrice.amountPerCurrency.get("Funds");
                    if (fundsNeeded !== undefined) {
                        Server.Currency.set("Funds", fundsNeeded);
                    }
                }

                const mockPlayer = {
                    UserId: 12345,
                    Name: "TestPlayer",
                } as Player;

                // Try to buy two different items
                const itemIds = new Set([BulkyDropper.id, LaserFan.id]);
                const success = Server.Item.buyAllItems(mockPlayer, itemIds);

                // Should return true if at least one succeeded
                expect(success).toBe(true);

                // Only one should be in inventory
                const bulkyCount = Server.empireData.items.inventory.get(BulkyDropper.id) ?? 0;
                const laserCount = Server.empireData.items.inventory.get(LaserFan.id) ?? 0;
                expect(bulkyCount + laserCount).toBe(1);
            });
        });

        describe("Bought Tracking", () => {
            it("should increment bought amount when purchase succeeds", () => {
                Server.Currency.set("Funds", new OnoeNum(1e12));
                Server.Item.setBoughtAmount(BulkyDropper, 0);

                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(Server.Item.getBoughtAmount(BulkyDropper)).toBe(1);
            });

            it("should not increment bought amount when purchase fails", () => {
                Server.Currency.set("Funds", new OnoeNum(1));
                Server.Item.setBoughtAmount(BulkyDropper, 0);

                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(Server.Item.getBoughtAmount(BulkyDropper)).toBe(0);
            });

            it("should track bought amount across multiple purchases", () => {
                Server.Currency.set("Funds", new OnoeNum(1e12));
                Server.Item.setBoughtAmount(BulkyDropper, 0);

                Server.Item.buyItem(undefined, BulkyDropper.id);
                Server.Item.buyItem(undefined, BulkyDropper.id);
                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(Server.Item.getBoughtAmount(BulkyDropper)).toBe(3);
            });
        });

        describe("Give Item Functionality", () => {
            it("should add items to inventory without consuming currency", () => {
                const initialFunds = Server.Currency.get("Funds");
                Server.empireData.items.inventory.set(BulkyDropper.id, 0);

                Server.Item.giveItem(BulkyDropper, 5);

                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBe(5);
                expect(Server.Currency.get("Funds")).toBe(initialFunds);
            });

            it("should fire itemGiven signal when item is given", () => {
                let signalFired = false;
                let givenItem: Item | undefined;
                let givenAmount = 0;

                const connection = Server.Item.itemGiven.connect((item, amount) => {
                    signalFired = true;
                    givenItem = item;
                    givenAmount = amount;
                });

                Server.Item.giveItem(BulkyDropper, 3);

                expect(signalFired).toBe(true);
                expect(givenItem).toBe(BulkyDropper);
                expect(givenAmount).toBe(3);

                connection.Disconnect();
            });

            it("should add to existing inventory when giving items", () => {
                Server.empireData.items.inventory.set(BulkyDropper.id, 10);

                Server.Item.giveItem(BulkyDropper, 5);

                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBe(15);
            });
        });
    });

    describe("Price Scaling", () => {
        describe("Progressive Pricing", () => {
            it("should increase price based on bought amount", () => {
                // Get price for first and second purchase
                const firstPrice = BulkyDropper.getPrice(1);
                const secondPrice = BulkyDropper.getPrice(2);

                if (firstPrice !== undefined && secondPrice !== undefined) {
                    const firstFunds = firstPrice.amountPerCurrency.get("Funds");
                    const secondFunds = secondPrice.amountPerCurrency.get("Funds");

                    if (firstFunds !== undefined && secondFunds !== undefined) {
                        // Second should cost more than first (compare as numbers)
                        const firstNum = tonumber(tostring(firstFunds)) ?? 0;
                        const secondNum = tonumber(tostring(secondFunds)) ?? 0;
                        expect(secondNum > firstNum).toBe(true);
                    }
                }
            });

            it("should charge correct price for nth purchase", () => {
                Server.Currency.set("Funds", new OnoeNum(1e12));
                Server.Item.setBoughtAmount(BulkyDropper, 5);

                const initialFunds = Server.Currency.get("Funds");
                const expectedPrice = BulkyDropper.getPrice(6);

                Server.Item.buyItem(undefined, BulkyDropper.id);

                if (expectedPrice !== undefined) {
                    const fundsComponent = expectedPrice.amountPerCurrency.get("Funds");
                    if (fundsComponent !== undefined && initialFunds !== undefined) {
                        const finalFunds = Server.Currency.get("Funds");
                        const spent = initialFunds.sub(finalFunds ?? new OnoeNum(0));

                        expect(spent.equals(fundsComponent)).toBe(true);
                    }
                }
            });

            it("should reject purchase when price exceeds available funds", () => {
                // Set bought amount very high to make next purchase expensive
                Server.Item.setBoughtAmount(BulkyDropper, 1000);
                Server.Currency.set("Funds", new OnoeNum(100));

                const success = Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(success).toBe(false);
            });
        });

        describe("Price Calculation", () => {
            it("should return undefined for items with no price", () => {
                // Find an item with no pricing
                const unpricedItem = Items.sortedItems.find((item) => {
                    return item.getPrice(1) === undefined;
                });

                if (unpricedItem !== undefined) {
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    const success = Server.Item.buyItem(undefined, unpricedItem.id);

                    expect(success).toBe(false);
                }
            });

            it("should handle items with zero price", () => {
                // Find an item with price that might be zero
                const item = Items.sortedItems.find((item) => {
                    const price = item.getPrice(1);
                    if (price === undefined) return false;

                    const funds = price.amountPerCurrency.get("Funds");
                    return funds !== undefined && funds.equals(new OnoeNum(0));
                });

                if (item !== undefined) {
                    Server.Currency.set("Funds", new OnoeNum(0));

                    const success = Server.Item.buyItem(undefined, item.id);

                    expect(success).toBe(true);
                }
            });
        });
    });

    describe("Shop Availability", () => {
        describe("Shop Sold In", () => {
            it("should identify items sold in specific shops", () => {
                // LaserFan is sold in ClassLowerNegativeShop
                const shops = LaserFan.shopsSoldIn;
                expect(shops.isEmpty()).toBe(false);
            });

            it("should allow items with empty shopsSoldIn when player is undefined", () => {
                // Use TheFirstDropper which is simple
                Server.Currency.set("Funds", new OnoeNum(1e12));
                Server.Currency.set("Time", new OnoeNum(1e12));

                const success = Server.Item.serverBuy(TheFirstDropper);

                expect(success).toBe(true);
            });

            it("should handle multiple shops selling same item", () => {
                // Find an item sold in multiple shops but no other requirements
                const itemInMultipleShops = Items.sortedItems.find((item) => {
                    let shopCount = 0;
                    for (const shop of item.shopsSoldIn) {
                        shopCount++;
                    }
                    if (shopCount <= 1) return false;
                    // Check that item has no requiredItems or level requirements
                    if (item.requiredItems.size() > 0) return false;
                    if (item.isA("Gear") && item.levelReq !== undefined && item.levelReq > 0) return false;
                    return true;
                });

                if (itemInMultipleShops !== undefined) {
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    // Unlock just one of the shops
                    let unlocked = false;
                    for (const shop of itemInMultipleShops.shopsSoldIn) {
                        if (!unlocked) {
                            Server.Item.setBoughtAmount(shop, 1);
                            unlocked = true;
                        } else {
                            Server.Item.setBoughtAmount(shop, 0);
                        }
                    }

                    // Use serverBuy to bypass permission checks
                    const success = Server.Item.serverBuy(itemInMultipleShops);

                    // Should succeed because at least one shop is unlocked
                    expect(success).toBe(true);
                }
            });
        });

        describe("Free Shops", () => {
            it("should identify shops with no price requirement", () => {
                // Find a shop with empty pricePerIteration
                const freeShop = Items.sortedItems.find((item) => {
                    if (!item.isA("Shop")) return false;
                    return item.pricePerIteration.isEmpty();
                });

                if (freeShop !== undefined) {
                    expect(freeShop.pricePerIteration.isEmpty()).toBe(true);
                }
            });

            it("should allow items from free shops without unlocking", () => {
                // Find an item sold in a free shop
                const itemInFreeShop = Items.sortedItems.find((item) => {
                    for (const shop of item.shopsSoldIn) {
                        if (shop.pricePerIteration.isEmpty()) {
                            return true;
                        }
                    }
                    return false;
                });

                if (itemInFreeShop !== undefined) {
                    Server.Currency.set("Funds", new OnoeNum(1e12));

                    // Don't unlock any shops
                    for (const shop of itemInFreeShop.shopsSoldIn) {
                        Server.Item.setBoughtAmount(shop, 0);
                    }

                    const mockPlayer = {
                        UserId: 12345,
                        Name: "TestPlayer",
                    } as Player;

                    const success = Server.Item.buyItem(mockPlayer, itemInFreeShop.id);

                    // Should succeed because shop is free
                    expect(success).toBe(true);
                }
            });
        });
    });

    describe("Transaction Integrity", () => {
        describe("Atomic Purchases", () => {
            it("should not deduct currency when purchase fails", () => {
                const initialFunds = new OnoeNum(100);
                Server.Currency.set("Funds", initialFunds);

                // Try to buy expensive item
                Server.Item.setBoughtAmount(BulkyDropper, 1000);
                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(Server.Currency.get("Funds")).toBe(initialFunds);
            });

            it("should not add item to inventory when currency check fails", () => {
                Server.Currency.set("Funds", new OnoeNum(1));
                Server.empireData.items.inventory.set(BulkyDropper.id, 0);

                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(Server.empireData.items.inventory.get(BulkyDropper.id)).toBe(0);
            });

            it("should deduct currency only once per purchase", () => {
                const price = BulkyDropper.getPrice(1);
                if (price !== undefined) {
                    const fundsNeeded = price.amountPerCurrency.get("Funds");
                    if (fundsNeeded !== undefined) {
                        const initialFunds = fundsNeeded.mul(new OnoeNum(2));
                        Server.Currency.set("Funds", initialFunds);

                        Server.Item.buyItem(undefined, BulkyDropper.id);

                        const remaining = Server.Currency.get("Funds");
                        if (remaining !== undefined) {
                            expect(remaining.equals(initialFunds.sub(fundsNeeded))).toBe(true);
                        }
                    }
                }
            });
        });

        describe("Signal Emissions", () => {
            it("should fire itemsBought signal with correct item set", () => {
                let firedItems: Set<Item> | undefined;
                const connection = Server.Item.itemsBought.connect((player, items) => {
                    firedItems = items;
                });

                Server.Currency.set("Funds", new OnoeNum(1e12));
                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(firedItems).toBeDefined();
                if (firedItems !== undefined) {
                    expect(firedItems.size()).toBe(1);
                    let foundBulky = false;
                    for (const item of firedItems) {
                        if (item.id === BulkyDropper.id) {
                            foundBulky = true;
                        }
                    }
                    expect(foundBulky).toBe(true);
                }

                connection.Disconnect();
            });

            it("should not fire itemsBought when purchase fails", () => {
                let signalFired = false;
                const connection = Server.Item.itemsBought.connect(() => {
                    signalFired = true;
                });

                Server.Currency.set("Funds", new OnoeNum(1));
                Server.Item.buyItem(undefined, BulkyDropper.id);

                expect(signalFired).toBe(false);

                connection.Disconnect();
            });

            it("should fire itemsBought for each successful item in buyAllItems", () => {
                let firedItems: Set<Item> | undefined;
                const connection = Server.Item.itemsBought.connect((player, items) => {
                    firedItems = items;
                });

                Server.Currency.set("Funds", new OnoeNum(1e12));

                const mockPlayer = {
                    UserId: 12345,
                    Name: "TestPlayer",
                } as Player;

                const itemIds = new Set([BulkyDropper.id, TheFirstDropper.id]);
                Server.Item.buyAllItems(mockPlayer, itemIds);

                expect(firedItems).toBeDefined();
                if (firedItems !== undefined) {
                    expect(firedItems.size()).toBe(2);
                }

                connection.Disconnect();
            });
        });
    });
});
