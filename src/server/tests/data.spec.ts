/// <reference types="@rbxts/testez/globals" />

import { OnoeNum } from "@antivivi/serikanum";
import CurrencyService from "server/services/serverdata/CurrencyService";
import DataService from "server/services/serverdata/DataService";
import ItemService from "server/services/serverdata/ItemService";
import UniqueItemService from "server/services/serverdata/UniqueItemService";

export = function () {
    const dataService = new DataService();
    const currencyService = new CurrencyService(dataService);
    const uniqueItemService = new UniqueItemService(dataService);
    const itemService = new ItemService(dataService, currencyService, uniqueItemService);

    describe("loading", () => {

        it("loads data", () => {
            expect(dataService).to.be.ok();
            expect(dataService.empireData).to.be.ok();
            expect(dataService.empireId).to.be.ok();
        });

        it("has a shop", () => {
            const items = dataService.empireData.items;
            const amount = items.inventory.get("ClassLowerNegativeShop");
            let hasShop = amount !== undefined && amount > 0;
            if (!hasShop) {
                const placedItems = items.worldPlaced;
                for (const [_, placedItem] of placedItems)
                    if (placedItem.item === "ClassLowerNegativeShop") {
                        hasShop = true;
                        break;
                    }
            }
            expect(hasShop).to.be.equal(true);
        });
    });

    describe("duplication", () => {

        it("removes excess in inventory", () => {
            const duped = {
                inventory: new Map<string, number>([
                    ["ClassLowerNegativeShop", 1],
                    ["TheFirstDropper", 4],
                ]),
                bought: new Map<string, number>([
                    ["TheFirstDropper", 3]
                ]),
                worldPlaced: new Map<string, PlacedItem>(),
                nextId: 0,
                uniqueItems: new Map<string, UniqueItemInstance>(),
            } as ItemsData;

            const unduped = {
                inventory: new Map<string, number>([
                    ["ClassLowerNegativeShop", 1],
                    ["TheFirstDropper", 2],
                ]),
                bought: new Map<string, number>([
                    ["TheFirstDropper", 2]
                ]),
                worldPlaced: new Map<string, PlacedItem>(),
                nextId: 0,
                uniqueItems: new Map<string, UniqueItemInstance>(),
            } as ItemsData;

            dataService.dupeCheck(duped);
            dataService.dupeCheck(unduped);

            expect(duped.inventory.get("ClassLowerNegativeShop")).to.be.equal(1);
            expect(duped.inventory.get("TheFirstDropper")).to.be.equal(3);
            expect(unduped.inventory.get("ClassLowerNegativeShop")).to.be.equal(1);
            expect(unduped.inventory.get("TheFirstDropper")).to.be.equal(2);
        });

        it("removes excess in bought", () => {
            const duped = {
                inventory: new Map<string, number>([
                    ["ClassLowerNegativeShop", 1],
                    ["TheFirstDropper", 3],
                ]),
                bought: new Map<string, number>([
                    ["TheFirstDropper", 1]
                ]),
                worldPlaced: new Map<string, PlacedItem>(),
                nextId: 0,
                uniqueItems: new Map<string, UniqueItemInstance>(),
            } as ItemsData;

            dataService.dupeCheck(duped);

            expect(duped.inventory.get("ClassLowerNegativeShop")).to.be.equal(1);
            expect(duped.inventory.get("TheFirstDropper")).to.be.equal(3);
            expect(duped.bought.get("TheFirstDropper")).to.be.equal(3);
        });
    });

    describe("items", () => {

        it("should buy a free item", () => {
            const itemId = "TheFirstDropper";
            itemService.setItemAmount(itemId, 0, true);
            itemService.setBoughtAmount(itemId, 0, true);
            expect(itemService.buyItem(undefined, itemId, true)).to.equal(true);
            expect(itemService.getItemAmount(itemId)).to.be.equal(1);
        });

        it("should buy a non-free item", () => {
            const itemId = "BulkyDropper";
            itemService.setItemAmount(itemId, 1, true);
            itemService.setBoughtAmount(itemId, 0, true);
            currencyService.set("Funds", new OnoeNum(1e6));
            expect(itemService.buyItem(undefined, itemId, true)).to.equal(true);
            expect(itemService.getItemAmount(itemId)).to.be.equal(2);
        });

        it("should not buy an item with insufficient funds", () => {
            const itemId = "BulkyDropper";
            itemService.setItemAmount(itemId, 1, true);
            itemService.setBoughtAmount(itemId, 0, true);
            currencyService.set("Funds", new OnoeNum(0));
            expect(itemService.buyItem(undefined, itemId, true)).to.equal(false);
            expect(itemService.getItemAmount(itemId)).to.be.equal(1);
        });
    });

    describe("unique items", () => {

        it("should create a unique item instance", () => {
            const itemId = "TheFirstDropperBooster";
            const uuid = uniqueItemService.createUniqueInstance(itemId);
            expect(uuid).to.be.ok();
            
            const instance = uniqueItemService.getUniqueInstance(uuid!);
            expect(instance).to.be.ok();
            expect(instance!.baseItemId).to.equal(itemId);
            expect(instance!.pots.size() > 0).to.equal(true);
        });

        it("should validate pot values are within range", () => {
            const itemId = "TheFirstDropperBooster";
            const uuid = uniqueItemService.createUniqueInstance(itemId);
            const instance = uniqueItemService.getUniqueInstance(uuid!);
            
            expect(instance).to.be.ok();
            
            // Check raw pot values are stored as 0-100 percentages
            for (const [potName, rawValue] of instance!.pots) {
                expect(rawValue >= 0).to.equal(true);
                expect(rawValue <= 100).to.equal(true);
            }
            
            // Check scaled values are within the expected ranges
            const scaledPots = uniqueItemService.getScaledPots(uuid!);
            expect(scaledPots).to.be.ok();
            
            // Check drop rate multiplier is between 1.1 and 3.0
            const dropRateMultiplier = scaledPots!.get("dropRateMultiplier");
            expect(dropRateMultiplier).to.be.ok();
            expect(dropRateMultiplier! >= 1.1).to.equal(true);
            expect(dropRateMultiplier! <= 3.0).to.equal(true);
            
            // Check value multiplier is between 1.05 and 2.5
            const valueMultiplier = scaledPots!.get("valueMultiplier");
            expect(valueMultiplier).to.be.ok();
            expect(valueMultiplier! >= 1.05).to.equal(true);
            expect(valueMultiplier! <= 2.5).to.equal(true);
            
            // Check radius is integer between 8 and 16
            const radius = scaledPots!.get("radius");
            expect(radius).to.be.ok();
            expect(radius! >= 8).to.equal(true);
            expect(radius! <= 16).to.equal(true);
            expect(radius! % 1).to.equal(0); // Should be integer
        });

        it("should format description with pot values", () => {
            const itemId = "TheFirstDropperBooster";
            const uuid = uniqueItemService.createUniqueInstance(itemId);
            const formattedDescription = uniqueItemService.getFormattedDescription(uuid!);
            
            expect(formattedDescription).to.be.ok();
            expect(string.find(formattedDescription!, "stud radius")[0]).to.be.ok();
            // The description should contain the actual pot values, not placeholders
            expect(string.find(formattedDescription!, "%%dropRateMultiplier%%")[0]).to.equal(undefined);
            expect(string.find(formattedDescription!, "%%valueMultiplier%%")[0]).to.equal(undefined);
            expect(string.find(formattedDescription!, "%%radius%%")[0]).to.equal(undefined);
        });

        it("should scale raw percentage values correctly", () => {
            const itemId = "TheFirstDropperBooster";
            const uuid = uniqueItemService.createUniqueInstance(itemId);
            const instance = uniqueItemService.getUniqueInstance(uuid!);
            const scaledPots = uniqueItemService.getScaledPots(uuid!);
            
            expect(instance).to.be.ok();
            expect(scaledPots).to.be.ok();
            
            // Verify that scaling works correctly for each pot
            for (const [potName, rawValue] of instance!.pots) {
                const scaledValue = scaledPots!.get(potName);
                expect(scaledValue).to.be.ok();
                
                // The scaled value should be different from the raw value (unless coincidentally equal)
                // and should be within the expected ranges
                if (potName === "dropRateMultiplier") {
                    expect(scaledValue! >= 1.1 && scaledValue! <= 3.0).to.equal(true);
                } else if (potName === "valueMultiplier") {
                    expect(scaledValue! >= 1.05 && scaledValue! <= 2.5).to.equal(true);
                } else if (potName === "radius") {
                    expect(scaledValue! >= 8 && scaledValue! <= 16).to.equal(true);
                    expect(scaledValue! % 1).to.equal(0); // Should be integer
                }
            }
        });
    });
};