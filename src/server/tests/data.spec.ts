/// <reference types="@rbxts/testez/globals" />

import { OnoeNum } from "@antivivi/serikanum";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";

export = function () {
    const dataService = new DataService();
    const currencyService = new CurrencyService(dataService);
    const itemsService = new ItemsService(dataService, currencyService);

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
                nextId: 0
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
                nextId: 0
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
                nextId: 0
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
            itemsService.setItemAmount(itemId, 0, true);
            itemsService.setBoughtAmount(itemId, 0, true);
            expect(itemsService.buyItem(undefined, itemId, true)).to.equal(true);
            expect(itemsService.getItemAmount(itemId)).to.be.equal(1);
        });

        it("should buy a non-free item", () => {
            const itemId = "BulkyDropper";
            itemsService.setItemAmount(itemId, 1, true);
            itemsService.setBoughtAmount(itemId, 0, true);
            currencyService.set("Funds", new OnoeNum(1e6));
            expect(itemsService.buyItem(undefined, itemId, true)).to.equal(true);
            expect(itemsService.getItemAmount(itemId)).to.be.equal(2);
        });

        it("should not buy an item with insufficient funds", () => {
            const itemId = "BulkyDropper";
            itemsService.setItemAmount(itemId, 1, true);
            itemsService.setBoughtAmount(itemId, 0, true);
            currencyService.set("Funds", new OnoeNum(0));
            expect(itemsService.buyItem(undefined, itemId, true)).to.equal(false);
            expect(itemsService.getItemAmount(itemId)).to.be.equal(1);
        });
    });
};