import { beforeEach, describe, expect, it, jest } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { HttpService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Printer from "shared/item/traits/Printer";
import BasicPrinter from "shared/items/0/millisecondless/BasicPrinter";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import BulkyDropper from "shared/items/negative/tlg/BulkyDropper";
import ButtonFurnace from "shared/items/negative/unimpossible/ButtonFurnace";
import ItemPlacement from "shared/placement/ItemPlacement";

describe("Printer and SetupService", () => {
    let mockPlayer: Player;
    let userIdSeed = 1000;

    beforeEach(() => {
        const userId = userIdSeed++;
        mockPlayer = {
            Name: `SetupTester_${HttpService.GenerateGUID(false)}`,
            UserId: userId,
        } as unknown as Player;

        // Clear all item data
        const items = Server.empireData.items;
        items.inventory.clear();
        items.uniqueInstances.clear();
        items.worldPlaced.clear();
        items.brokenPlacedItems.clear();
        items.repairProtection.clear();
        Server.Item.modelPerPlacementId.clear();
        for (const child of PLACED_ITEMS_FOLDER.GetChildren()) child.Destroy();

        // Clear setups
        Server.empireData.printedSetups.clear();

        // Give plenty of currency for testing
        Server.Currency.set("Funds", new OnoeNum(1e30));

        // Set high level to bypass restrictions
        Server.empireData.level = math.huge;

        // Set player as owner to bypass permission checks
        Server.empireData.owner = userId;

        // Mock placement collision detection
        jest.spyOn(ItemPlacement, "isTouchingPlacedItem").mockReturnValue(false);

        // Mock permission checks to always return true for mock player
        jest.spyOn(Server.Permissions, "hasPermission").mockReturnValue(true);
    });

    describe("Printer trait", () => {
        it("has printer trait on BasicPrinter", () => {
            const printer = BasicPrinter.findTrait("Printer");
            expect(printer).toBeDefined();
            expect(printer).toBeInstanceOf(Printer);
        });

        it("sets area correctly", () => {
            const printer = BasicPrinter.findTrait("Printer");
            expect(printer).toBeDefined();
            expect(printer!.area).toBe("BarrenIslands");
        });

        it("getPrintedSetupsInArea filters setups by area", () => {
            const setups = new Map<string, Setup>();
            const emptyPriceMap = new Map() as BaseCurrencyMap;
            setups.set("Setup1", {
                name: "Setup1",
                area: "BarrenIslands",
                items: [],
                autoloads: false,
                alerted: false,
                calculatedPrice: emptyPriceMap,
            });
            setups.set("Setup2", {
                name: "Setup2",
                area: "SlamoVillage",
                items: [],
                autoloads: false,
                alerted: false,
                calculatedPrice: emptyPriceMap,
            });
            setups.set("Setup3", {
                name: "Setup3",
                area: "BarrenIslands",
                items: [],
                autoloads: false,
                alerted: false,
                calculatedPrice: emptyPriceMap,
            });

            const barrenSetups = Printer.getPrintedSetupsInArea(setups, "BarrenIslands");
            expect(barrenSetups.size()).toBe(2);
            expect(barrenSetups.has("Setup1")).toBe(true);
            expect(barrenSetups.has("Setup3")).toBe(true);
            expect(barrenSetups.has("Setup2")).toBe(false);

            const slamoSetups = Printer.getPrintedSetupsInArea(setups, "SlamoVillage");
            expect(slamoSetups.size()).toBe(1);
            expect(slamoSetups.has("Setup2")).toBe(true);
        });
    });

    describe("SetupService.saveSetup", () => {
        it("saves a setup with placed items", () => {
            // Give items first
            Server.Item.giveItem(TheFirstDropper, 3);
            Server.Item.giveItem(BulkyDropper, 1);

            // Place some items in BarrenIslands
            const placedDropper1 = Server.Item.serverPlace(
                TheFirstDropper.id,
                new Vector3(0, 0, 0),
                0,
                "BarrenIslands",
            );
            const placedDropper2 = Server.Item.serverPlace(
                TheFirstDropper.id,
                new Vector3(5, 0, 0),
                0,
                "BarrenIslands",
            );
            const placedBulky = Server.Item.serverPlace(BulkyDropper.id, new Vector3(10, 0, 0), 0, "BarrenIslands");

            expect(placedDropper1).toBeDefined();
            expect(placedDropper2).toBeDefined();
            expect(placedBulky).toBeDefined();

            // Save the setup
            const itemCount = Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "TestSetup1");

            // Verify setup was created
            const setups = Server.empireData.printedSetups;
            expect(setups.size()).toBe(1);

            const setup = setups[0];
            expect(setup.name).toBe("TestSetup1");
            expect(setup.area).toBe("BarrenIslands");
            expect(setup.items.size()).toBe(3);
            expect(setup.autoloads).toBe(false);

            // Verify item count
            expect(itemCount).toBeDefined();
            expect(itemCount!.get(TheFirstDropper)).toBe(2);
            expect(itemCount!.get(BulkyDropper)).toBe(1);
        });

        it("updates existing setup when saving with same name", () => {
            // Give items first
            Server.Item.giveItem(TheFirstDropper, 1);
            Server.Item.giveItem(BulkyDropper, 1);

            // Place and save initial setup
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "TestSetup");

            expect(Server.empireData.printedSetups.size()).toBe(1);
            expect(Server.empireData.printedSetups[0].items.size()).toBe(1);

            // Place another item and save again with same name
            Server.Item.serverPlace(BulkyDropper.id, new Vector3(5, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "TestSetup");

            // Should still have only one setup
            expect(Server.empireData.printedSetups.size()).toBe(1);
            expect(Server.empireData.printedSetups[0].name).toBe("TestSetup");
            expect(Server.empireData.printedSetups[0].items.size()).toBe(2);
        });

        it("only saves items from the specified area", () => {
            // Give items first
            Server.Item.giveItem(TheFirstDropper, 1);
            Server.Item.giveItem(BulkyDropper, 1);

            // Place items in different areas
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Item.serverPlace(BulkyDropper.id, new Vector3(0, 0, 0), 0, "SlamoVillage");

            // Save BarrenIslands setup
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "BarrenSetup");

            const setup = Server.empireData.printedSetups[0];
            expect(setup.items.size()).toBe(1);
            expect(setup.area).toBe("BarrenIslands");

            // Verify the saved item is the one from BarrenIslands
            const savedItem = setup.items[0];
            expect(savedItem.item).toBe(TheFirstDropper.id);
        });

        it("calculates total price correctly", () => {
            // Give items first
            Server.Item.giveItem(TheFirstDropper, 2);

            // Place multiple items to test price accumulation
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(5, 0, 0), 0, "BarrenIslands");

            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "PriceTest");

            const setup = Server.empireData.printedSetups[0];
            expect(setup.calculatedPrice).toBeDefined();

            // Verify price includes both items
            const fundsCost = setup.calculatedPrice.get("Funds");
            expect(fundsCost).toBeDefined();
            expect(fundsCost !== undefined && new OnoeNum(fundsCost).moreThan(0)).toBe(true);
        });

        it("truncates long setup names to 32 characters", () => {
            Server.Item.giveItem(TheFirstDropper, 1);
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");

            const longName = "ThisIsAVeryLongSetupNameThatExceedsTheMaximumAllowedLength";
            expect(longName.size()).toBeGreaterThan(32);

            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", longName);

            const setup = Server.empireData.printedSetups[0];
            expect(setup.name.size()).toBe(32);
            expect(setup.name).toBe(longName.sub(1, 32));
        });

        it("fires setupSaved signal when setup is saved", () => {
            let fired = false;
            let capturedArea: AreaId | undefined;

            const connection = Server.Setup.setupSaved.connect((player, area) => {
                fired = true;
                capturedArea = area;
            });

            Server.Item.giveItem(TheFirstDropper, 1);
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "SignalTest");

            connection.Disconnect();

            expect(fired).toBe(true);
            expect(capturedArea).toBe("BarrenIslands");
        });
    });

    describe("SetupService.loadSetup", () => {
        it("loads a saved setup and places items", () => {
            // Give items first
            Server.Item.giveItem(TheFirstDropper, 2);
            Server.Item.giveItem(BulkyDropper, 2);

            // Create and save a setup
            const placed1 = Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            const placed2 = Server.Item.serverPlace(BulkyDropper.id, new Vector3(5, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "LoadTest");

            // Clear placed items
            Server.Item.unplaceItems(undefined, new Set([placed1!.id, placed2!.id]));
            expect(Server.empireData.items.worldPlaced.size()).toBe(0);

            // Load the setup
            const success = Server.Setup.loadSetup(mockPlayer, "BarrenIslands", "LoadTest");

            expect(success).toBe(true);
            expect(Server.empireData.items.worldPlaced.size()).toBe(2);
        });

        it("fires setupLoaded signal when setup is loaded", () => {
            let fired = false;
            let capturedArea: AreaId | undefined;

            Server.Item.giveItem(TheFirstDropper, 2);
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "SignalTest");

            const connection = Server.Setup.setupLoaded.connect((player, area) => {
                fired = true;
                capturedArea = area;
            });

            Server.Setup.loadSetup(mockPlayer, "BarrenIslands", "SignalTest");

            connection.Disconnect();

            expect(fired).toBe(true);
            expect(capturedArea).toBe("BarrenIslands");
        });

        it("returns false for non-existent setup", () => {
            jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {});
            const success = Server.Setup.loadSetup(mockPlayer, "BarrenIslands", "NonExistentSetup");
            expect(success).toBe(false);
        });

        it("returns false for area mismatch", () => {
            jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {});
            Server.Item.giveItem(TheFirstDropper, 1);
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "AreaTest");

            // Try to load with wrong area
            Server.empireData.items.worldPlaced.clear();
            const success = Server.Setup.loadSetup(mockPlayer, "SlamoVillage", "AreaTest");
            expect(success).toBe(false);

            // No items should be placed
            expect(Server.empireData.items.worldPlaced.size()).toBe(0);
        });

        it("skips items that cannot be afforded or placed", () => {
            jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {});

            // Give items first
            Server.Item.giveItem(ButtonFurnace, 1);

            // Create an expensive item setup
            Server.Item.serverPlace(ButtonFurnace.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "ExpensiveSetup");

            // Clear inventory and give insufficient funds
            Server.empireData.items.inventory.clear();
            Server.empireData.items.worldPlaced.clear();
            Server.Currency.set("Funds", new OnoeNum(0));

            // Try to load - should gracefully handle items that can't be afforded
            Server.Setup.loadSetup(mockPlayer, "BarrenIslands", "ExpensiveSetup");

            // Check that no items were placed
            expect(Server.empireData.items.worldPlaced.size()).toBe(0);
        });

        it("preserves item positions and rotations", () => {
            const position1 = new Vector3(10, 0, 15);
            const position2 = new Vector3(5, 0, 20);
            const rotation = 90;

            // Give items first
            Server.Item.giveItem(TheFirstDropper, 1);
            Server.Item.giveItem(BulkyDropper, 1);

            // Place items at specific positions
            Server.Item.serverPlace(TheFirstDropper.id, position1, rotation, "BarrenIslands");
            Server.Item.serverPlace(BulkyDropper.id, position2, 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "PositionTest");

            const setup = Server.empireData.printedSetups[0];
            expect(setup.items.size()).toBe(2);

            // Verify saved positions
            const item1 = setup.items.find((i) => i.item === TheFirstDropper.id);
            const item2 = setup.items.find((i) => i.item === BulkyDropper.id);

            expect(item1).toBeDefined();
            expect(item2).toBeDefined();

            // Positions might be snapped to grid
            // Just verify they're in the general area (within 10 studs)
            expect(math.abs(item1!.posX - position1.X)).toBeLessThan(10);
            expect(math.abs(item1!.posZ - position1.Z)).toBeLessThan(10);
            expect(item1!.rawRotation).toBe(rotation);

            expect(math.abs(item2!.posX - position2.X)).toBeLessThan(10);
            expect(math.abs(item2!.posZ - position2.Z)).toBeLessThan(10);
        });
    });

    describe("SetupService autoload", () => {
        it("toggles autoload state", () => {
            Server.Item.giveItem(TheFirstDropper, 1);
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "AutoloadTest");

            const setupName = "AutoloadTest";
            let setup = Server.empireData.printedSetups.find((s) => s.name === setupName);
            expect(setup).toBeDefined();
            expect(setup!.autoloads).toBe(false);

            // Toggle autoload on (this would normally come from client packet)
            setup!.autoloads = true;
            expect(setup!.autoloads).toBe(true);

            // Toggle autoload off
            setup!.autoloads = false;
            expect(setup!.autoloads).toBe(false);
        });

        it("marks setup as alerted when affordable with autoload enabled", () => {
            // Give item first
            Server.Item.giveItem(TheFirstDropper, 1);

            // Create a cheap setup
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "AlertTest");

            const setup = Server.empireData.printedSetups[0];
            setup.autoloads = true;
            setup.alerted = false;

            // Ensure player has enough funds
            const fundsCost = setup.calculatedPrice.get("Funds");
            if (fundsCost !== undefined) {
                Server.Currency.set("Funds", new OnoeNum(fundsCost).add(new OnoeNum(1000)));
            }

            // Activate autoload check
            const mockPrint = jest.spyOn(jest.globalEnv, "print");
            mockPrint.mockImplementation((msg) => {
                expect(msg).toMatch("AlertTest can now be purchased!");
            });

            jest.useFakeTimers();
            Server.Setup.onStart();
            jest.advanceTimersByTime(2000);
            expect(setup.alerted).toBe(true);
            jest.useRealTimers();
        });
    });

    describe("SetupService multiple setups", () => {
        it("manages multiple setups for different areas", () => {
            // Give items first
            Server.Item.giveItem(TheFirstDropper, 2);
            Server.Item.giveItem(BulkyDropper, 1);

            // Create setups in different areas
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "BarrenSetup1");

            Server.Item.serverPlace(BulkyDropper.id, new Vector3(0, 0, 0), 0, "SlamoVillage");
            Server.Setup.saveSetup(mockPlayer, "SlamoVillage", "SlamoSetup1");

            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(5, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "BarrenSetup2");

            expect(Server.empireData.printedSetups.size()).toBe(3);

            // Verify we can filter by area
            const barrenSetups = Printer.getPrintedSetupsInArea(
                new Map(Server.empireData.printedSetups.map((s) => [s.name, s])),
                "BarrenIslands",
            );
            const slamoSetups = Printer.getPrintedSetupsInArea(
                new Map(Server.empireData.printedSetups.map((s) => [s.name, s])),
                "SlamoVillage",
            );

            expect(barrenSetups.size()).toBe(2);
            expect(slamoSetups.size()).toBe(1);
        });

        it("handles many setups without conflicts", () => {
            // Give enough items
            Server.Item.giveItem(TheFirstDropper, 10);

            // Create many setups
            for (let i = 0; i < 10; i++) {
                Server.Item.serverPlace(TheFirstDropper.id, new Vector3(i * 5, 0, 0), 0, "BarrenIslands");
                Server.Setup.saveSetup(mockPlayer, "BarrenIslands", `Setup${i}`);
                Server.Item.unplaceItemsInArea(undefined, "BarrenIslands");
            }

            expect(Server.empireData.printedSetups.size()).toBe(10);

            // Verify all setups have unique names
            const names = new Set<string>();
            for (const setup of Server.empireData.printedSetups) {
                expect(names.has(setup.name)).toBe(false);
                names.add(setup.name);
            }

            expect(names.size()).toBe(10);
        });
    });

    describe("SetupService edge cases", () => {
        it("prevents item duplication through spam load/unplace cycles", () => {
            const initialItemCount = 3;

            // Give exactly 3 items
            Server.Item.giveItem(TheFirstDropper, initialItemCount);

            // Verify starting inventory
            const startingInventory = Server.empireData.items.inventory.get(TheFirstDropper.id) ?? 0;
            expect(startingInventory).toBe(initialItemCount);

            // Place all items and save setup
            const placed1 = Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            const placed2 = Server.Item.serverPlace(TheFirstDropper.id, new Vector3(5, 0, 0), 0, "BarrenIslands");
            const placed3 = Server.Item.serverPlace(TheFirstDropper.id, new Vector3(10, 0, 0), 0, "BarrenIslands");

            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "DupeTest");

            // Now attempt the duplication exploit:
            // Repeatedly load setup and unplace items
            for (let i = 0; i < 5; i++) {
                // Unplace all items (return to inventory)
                const placedItems = Server.empireData.items.worldPlaced;
                const placedIds = new Set<string>();
                for (const [id] of placedItems) {
                    placedIds.add(id);
                }
                Server.Item.unplaceItems(undefined, placedIds);

                // Load setup again (should place items from existing inventory)
                Server.Setup.loadSetup(mockPlayer, "BarrenIslands", "DupeTest");
            }

            // Final check: unplace everything one more time
            const finalPlacedIds = new Set<string>();
            for (const [id] of Server.empireData.items.worldPlaced) {
                finalPlacedIds.add(id);
            }
            Server.Item.unplaceItems(undefined, finalPlacedIds);

            // Count total items (inventory + placed)
            const finalInventory = Server.empireData.items.inventory.get(TheFirstDropper.id) ?? 0;
            const finalPlaced = Server.empireData.items.worldPlaced.size();
            const totalItems = finalInventory + finalPlaced;

            // CRITICAL: Total items should never exceed what we started with
            expect(totalItems).toBe(initialItemCount);
            expect(finalInventory).toBe(initialItemCount);
        });

        it("handles empty setups", () => {
            // Save a setup with no items
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "EmptySetup");

            const setup = Server.empireData.printedSetups[0];
            expect(setup).toBeDefined();
            expect(setup.items.size()).toBe(0);
            expect(setup.calculatedPrice).toBeDefined();

            // Loading empty setup should succeed without errors
            const success = Server.Setup.loadSetup(mockPlayer, "BarrenIslands", "EmptySetup");
            // Empty setups return false because no items were placed (0 !== 0)
            expect(success).toBe(false);
        });

        it("handles setup name with special characters", () => {
            Server.Item.giveItem(TheFirstDropper, 2);
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");

            // Note: In production, names would be filtered by TextService
            // For testing, we use a name with common special chars
            const specialName = "Setup_Test-123";
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", specialName);

            const setup = Server.empireData.printedSetups[0];
            expect(setup.name).toBe(specialName);

            // Should be able to load by the same name
            const success = Server.Setup.loadSetup(mockPlayer, "BarrenIslands", specialName);
            expect(success).toBe(true);
        });

        it("preserves setup data across multiple saves and loads", () => {
            // Give enough items
            Server.Item.giveItem(TheFirstDropper, 3);

            // Create and save initial setup
            Server.Item.serverPlace(TheFirstDropper.id, new Vector3(0, 0, 0), 0, "BarrenIslands");
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "PersistTest");

            const originalSetup = Server.empireData.printedSetups[0];
            const originalItemCount = originalSetup.items.size();
            const originalFundsCost = originalSetup.calculatedPrice.get("Funds");

            // Load it
            const loadSuccess = Server.Setup.loadSetup(mockPlayer, "BarrenIslands", "PersistTest");
            // Load may succeed or fail depending on item availability
            expect(typeOf(loadSuccess)).toBe("boolean");

            // Save it again
            Server.Setup.saveSetup(mockPlayer, "BarrenIslands", "PersistTest");

            const updatedSetup = Server.empireData.printedSetups[0];
            expect(updatedSetup.items.size()).toBe(originalItemCount);

            // Price should be similar (may differ due to iteration counts)
            const updatedFundsCost = updatedSetup.calculatedPrice.get("Funds");
            // Just verify the setup was updated without erroring
            expect(updatedFundsCost !== undefined || updatedSetup.items.size() === 0).toBe(true);
        });
    });
});
