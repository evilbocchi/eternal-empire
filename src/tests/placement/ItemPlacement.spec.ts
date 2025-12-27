import { describe, expect, it, beforeEach, afterEach } from "@rbxts/jest-globals";
import { Workspace, CollectionService } from "@rbxts/services";
import ItemPlacement = require("shared/placement/ItemPlacement");
import BuildBounds = require("shared/placement/BuildBounds");
import Item from "shared/item/Item";
import Area from "shared/world/Area";

describe("ItemPlacement", () => {
    let testPart: BasePart;
    let itemModel: Model;

    beforeEach(() => {
        // Create a test part in workspace that will act as an existing item
        testPart = new Instance("Part");
        testPart.Name = "Hitbox";
        testPart.Size = new Vector3(3, 3, 3);
        testPart.Position = new Vector3(0, 0, 0);
        testPart.CollisionGroup = "ItemHitbox";
        testPart.Parent = Workspace;

        // Create a test item model
        itemModel = new Instance("Model");
        itemModel.Name = "TestItem";
        const hitbox = new Instance("Part");
        hitbox.Name = "Hitbox";
        hitbox.Size = new Vector3(3, 3, 3);
        hitbox.CollisionGroup = "ItemHitbox";
        hitbox.Parent = itemModel;
        itemModel.PrimaryPart = hitbox;
        itemModel.Parent = Workspace;
    });

    afterEach(() => {
        testPart.Destroy();
        itemModel.Destroy();
    });

    describe("Collision Detection", () => {
        it("detects collision with existing item", () => {
            // Position item model at same location as test part
            itemModel.PrimaryPart!.Position = new Vector3(0, 0, 0);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            expect(result).toBe(true);
        });

        it("allows placement in empty space", () => {
            // Position item model far away from test part
            itemModel.PrimaryPart!.Position = new Vector3(50, 0, 50);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            expect(result).toBe(false);
        });

        it("detects collision when items overlap partially", () => {
            // Position so items overlap by 1 stud
            itemModel.PrimaryPart!.Position = new Vector3(2, 0, 0);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            expect(result).toBe(true);
        });

        it("allows placement when items are edge-touching but not overlapping", () => {
            // Position exactly at edge (3 studs away)
            itemModel.PrimaryPart!.Position = new Vector3(3.1, 0, 0);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            expect(result).toBe(false);
        });

        it("handles different item sizes", () => {
            // Create larger item
            const largeHitbox = new Instance("Part");
            largeHitbox.Name = "Hitbox";
            largeHitbox.Size = new Vector3(6, 6, 6);
            largeHitbox.CollisionGroup = "ItemHitbox";
            largeHitbox.Parent = itemModel;
            itemModel.PrimaryPart = largeHitbox;

            itemModel.PrimaryPart.Position = new Vector3(4, 0, 0);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            expect(result).toBe(true);

            largeHitbox.Destroy();
        });

        it("ignores bounce animation during placement", () => {
            // Set bounce animation attribute (recent placement)
            itemModel.SetAttribute("BounceAnimationStartTime", os.clock());

            itemModel.PrimaryPart!.Position = new Vector3(0, 0, 0);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            // Should return false during bounce animation
            expect(result).toBe(false);
        });

        it("detects collision after bounce animation ends", () => {
            // Set bounce animation attribute to old time
            itemModel.SetAttribute("BounceAnimationStartTime", os.clock() - 1);

            itemModel.PrimaryPart!.Position = new Vector3(0, 0, 0);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            // Should detect collision after bounce ends
            expect(result).toBe(true);
        });

        it("handles rapid placement checks without false positives", () => {
            itemModel.PrimaryPart!.Position = new Vector3(50, 0, 50);

            // Perform multiple rapid checks
            for (let i = 0; i < 10; i++) {
                const result = ItemPlacement.isTouchingPlacedItem(itemModel);
                expect(result).toBe(false);
            }
        });

        it("detects collision with multiple nearby items", () => {
            // Create second item
            const secondModel = itemModel.Clone();
            secondModel.Name = "SecondItem";
            secondModel.Parent = Workspace;
            secondModel.PrimaryPart!.Position = new Vector3(10, 0, 0);

            // Create third item that overlaps with second
            const thirdModel = itemModel.Clone();
            thirdModel.Name = "ThirdItem";
            thirdModel.Parent = Workspace;
            thirdModel.PrimaryPart!.Position = new Vector3(10, 0, 0);

            const result = ItemPlacement.isTouchingPlacedItem(thirdModel);
            expect(result).toBe(true);

            secondModel.Destroy();
            thirdModel.Destroy();
        });

        it("handles rotated items correctly", () => {
            // Create rectangular item
            const rectHitbox = new Instance("Part");
            rectHitbox.Name = "Hitbox";
            rectHitbox.Size = new Vector3(6, 3, 3);
            rectHitbox.CollisionGroup = "ItemHitbox";
            rectHitbox.CFrame = new CFrame(0, 0, 0).mul(CFrame.Angles(0, math.rad(90), 0));
            rectHitbox.Parent = itemModel;
            itemModel.PrimaryPart = rectHitbox;

            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            expect(result).toBe(true);

            rectHitbox.Destroy();
        });
    });

    describe("Area Detection", () => {
        let gridPart: BasePart;
        let area: Area;
        let placeableAreas: Set<Area>;

        beforeEach(() => {
            // Create build area
            gridPart = new Instance("Part");
            gridPart.Name = "TestGrid";
            gridPart.Size = new Vector3(30, 1, 30);
            gridPart.Position = new Vector3(0, 0, 0);
            gridPart.Parent = Workspace;

            // Create Area with BuildBounds
            const bounds = new BuildBounds(gridPart);
            area = {
                id: "testArea",
                buildBounds: bounds,
            } as unknown as Area;
            placeableAreas = new Set([area]);
        });

        afterEach(() => {
            gridPart.Destroy();
        });

        it("finds area containing position", () => {
            const position = new Vector3(0, 0, 0);
            const foundArea = ItemPlacement.getAreaOfPosition(position, placeableAreas);
            expect(foundArea).toBe(area);
        });

        it("returns undefined for position outside all areas", () => {
            const position = new Vector3(100, 0, 100);
            const foundArea = ItemPlacement.getAreaOfPosition(position, placeableAreas);
            expect(foundArea).toBeUndefined();
        });

        it("finds area containing item model", () => {
            itemModel.PrimaryPart!.Position = new Vector3(0, 0, 0);
            const foundArea = ItemPlacement.getArea(itemModel, placeableAreas);
            expect(foundArea).toBeDefined();
        });

        it("returns undefined for item outside all areas", () => {
            itemModel.PrimaryPart!.Position = new Vector3(100, 0, 100);
            const foundArea = ItemPlacement.getArea(itemModel, placeableAreas);
            expect(foundArea).toBeUndefined();
        });

        it("validates item in placeable area", () => {
            const item = new Item("test");
            item.placeableAreas.add(area);

            itemModel.PrimaryPart!.Position = new Vector3(0, 0, 0);
            const isValid = ItemPlacement.isInPlaceableArea(itemModel, item);
            expect(isValid).toBe(true);
        });

        it("invalidates item outside placeable area", () => {
            const item = new Item("test");
            item.placeableAreas.add(area);

            itemModel.PrimaryPart!.Position = new Vector3(100, 0, 100);
            const isValid = ItemPlacement.isInPlaceableArea(itemModel, item);
            expect(isValid).toBe(false);
        });
    });

    describe("Custom Bounds Validation", () => {
        let boundsPart: BasePart;

        beforeEach(() => {
            boundsPart = new Instance("Part");
            boundsPart.Name = "CustomBounds";
            boundsPart.Size = new Vector3(20, 20, 20);
            boundsPart.Position = new Vector3(0, 0, 0);
            boundsPart.Parent = Workspace;
        });

        afterEach(() => {
            boundsPart.Destroy();
        });

        it("validates item with custom bounds", () => {
            const item = new Item("test");
            item.bounds = "CustomBounds";

            itemModel.PrimaryPart!.Position = new Vector3(0, 0, 0);
            const isValid = ItemPlacement.isInPlaceableArea(itemModel, item);
            expect(isValid).toBe(true);
        });

        it("invalidates item outside custom bounds", () => {
            const item = new Item("test");
            item.bounds = "CustomBounds";

            itemModel.PrimaryPart!.Position = new Vector3(50, 0, 50);
            const isValid = ItemPlacement.isInPlaceableArea(itemModel, item);
            expect(isValid).toBe(false);
        });

        it("handles missing primary part gracefully", () => {
            const item = new Item("test");
            item.bounds = "CustomBounds";

            const modelWithoutPrimary = new Instance("Model");
            modelWithoutPrimary.Parent = Workspace;

            const isValid = ItemPlacement.isInPlaceableArea(modelWithoutPrimary, item);
            expect(isValid).toBe(false);

            modelWithoutPrimary.Destroy();
        });
    });

    describe("Edge Cases", () => {
        it("handles model without hitbox", () => {
            const emptyModel = new Instance("Model");
            emptyModel.Name = "EmptyModel";
            emptyModel.Parent = Workspace;

            const result = ItemPlacement.isTouchingPlacedItem(emptyModel);
            expect(result).toBe(false);

            emptyModel.Destroy();
        });

        it("handles model with non-BasePart hitbox child", () => {
            const folder = new Instance("Folder");
            folder.Name = "Hitbox";
            folder.Parent = itemModel;

            itemModel.PrimaryPart!.Position = new Vector3(0, 0, 0);
            const result = ItemPlacement.isTouchingPlacedItem(itemModel);
            // Should still work with actual BasePart hitbox
            expect(result).toBe(true);

            folder.Destroy();
        });

        it("handles same-named items correctly", () => {
            // Remove testPart to avoid interference
            testPart.Destroy();

            const duplicateModel = itemModel.Clone();
            duplicateModel.Parent = Workspace;
            duplicateModel.PrimaryPart!.Position = new Vector3(0, 0, 0);

            // Should not detect collision with itself (same name)
            const result = ItemPlacement.isTouchingPlacedItem(duplicateModel);
            // Same name items should be ignored
            expect(result).toBe(false);

            duplicateModel.Destroy();
        });
    });
});
