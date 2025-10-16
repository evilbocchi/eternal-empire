/// <reference types="@rbxts/testez/globals" />
import { OnoeNum } from "@rbxts/serikanum";
import { Janitor } from "@rbxts/janitor";
import { Server } from "shared/api/APIExpose";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
        mockFlamework();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
    });

    describe("ItemService", () => {
        beforeEach(() => {
            const items = Server.Data.empireData.items;
            items.inventory.set("TheFirstDropper", 0);
            items.inventory.set("BulkyDropper", 0);
            items.uniqueInstances.clear();
            items.worldPlaced.clear();
            items.brokenPlacedItems.clear();
            items.repairProtection.clear();
            Server.Item.setItemAmount("TheFirstDropper", 0);
            Server.Item.setItemAmount("BulkyDropper", 0);
            Server.Item.setBoughtAmount("TheFirstDropper", 0);
            Server.Item.setBoughtAmount("BulkyDropper", 0);
            Server.Currency.set("Funds", new OnoeNum(1e6));
        });

        it("gives non-unique items directly into the inventory", () => {
            Server.Item.giveItem("TheFirstDropper", 2);
            expect(Server.Item.getItemAmount("TheFirstDropper")).to.equal(2);
        });

        it("creates unique item instances when giving unique items", () => {
            const uniqueInstances = Server.Data.empireData.items.uniqueInstances;
            expect(uniqueInstances.size()).to.equal(0);

            Server.Item.giveItem("TheFirstDropperBooster", 1);

            expect(uniqueInstances.size()).to.equal(1);
            for (const [, instance] of uniqueInstances) {
                expect(instance.baseItemId).to.equal("TheFirstDropperBooster");
                expect(instance.pots.size() > 0).to.equal(true);
            }
        });

        it("fires itemsBought when purchases succeed", () => {
            let fired = false;
            const connection = Server.Item.itemsBought.connect((player, items) => {
                expect(player).to.equal(undefined);
                let hasBulkyDropper = false;
                for (const item of items) {
                    hasBulkyDropper = item.id === "BulkyDropper";
                }
                fired = hasBulkyDropper && items.size() === 1;
            });

            Server.Item.setItemAmount("BulkyDropper", 0);
            Server.Item.setBoughtAmount("BulkyDropper", 0);
            Server.Currency.set("Funds", new OnoeNum(1e6));

            const success = Server.Item.buyItem(undefined, "BulkyDropper");
            connection.Disconnect();

            expect(success).to.equal(true);
            expect(fired).to.equal(true);
            expect(Server.Item.getItemAmount("BulkyDropper") > 0).to.equal(true);
        });

        it("returns items to inventory when unplaced", () => {
            const placementId = "TEST_PLACEMENT";
            const placedItem: PlacedItem = {
                item: "TheFirstDropper",
                posX: 0,
                posY: 0,
                posZ: 0,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                area: "BarrenIslands",
            };

            Server.Data.empireData.items.worldPlaced.set(placementId, placedItem);
            Server.Item.setItemAmount("TheFirstDropper", 0);

            const unplaced = Server.Item.unplaceItems(undefined, new Set([placementId]));

            expect(unplaced).to.be.ok();
            expect(unplaced?.size()).to.equal(1);
            expect(Server.Item.getItemAmount("TheFirstDropper")).to.equal(1);
        });
    });
};
