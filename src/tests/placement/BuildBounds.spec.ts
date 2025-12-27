import { afterEach, beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { Workspace } from "@rbxts/services";
import BuildBounds = require("shared/placement/BuildBounds");

describe("BuildBounds", () => {
    let gridPart: BasePart;

    beforeEach(() => {
        gridPart = new Instance("Part");
        gridPart.Name = "TestGrid";
        gridPart.Size = new Vector3(30, 1, 30);
        gridPart.Position = new Vector3(300, 0, 300);
        gridPart.Parent = Workspace;
    });

    afterEach(() => {
        gridPart.Destroy();
    });

    describe("Construction and Drawing", () => {
        it("constructs without a part", () => {
            const bounds = new BuildBounds();
            expect(bounds).toBeDefined();
            expect(bounds.canvasSize).toBeUndefined();
        });

        it("constructs with a part", () => {
            const bounds = new BuildBounds(gridPart);
            expect(bounds).toBeDefined();
            expect(bounds.canvasSize).toBeDefined();
        });

        it("draws build area from grid part", () => {
            const bounds = new BuildBounds();
            bounds.draw(gridPart);

            expect(bounds.canvasSize).toBeDefined();
            expect(bounds.canvasCFrame).toBeDefined();
            expect(bounds.canvasAltitude).toBeDefined();
        });

        it("updates properties when grid size changes", () => {
            const bounds = new BuildBounds(gridPart);
            const originalSize = bounds.canvasSize;

            gridPart.Size = new Vector3(60, 1, 60);
            const newSize = bounds.canvasSize;

            expect(newSize).toBeDefined();
            expect(originalSize).toBeDefined();
            if (newSize && originalSize) {
                expect(newSize.X).never.toBe(originalSize.X);
                expect(newSize.Y).never.toBe(originalSize.Y);
            }
        });
    });

    describe("Grid Snapping", () => {
        let bounds: BuildBounds;

        beforeEach(() => {
            bounds = new BuildBounds(gridPart);
        });

        it("snaps item to 3-stud grid", () => {
            const size = new Vector3(3, 3, 3);
            const position = new Vector3(300.5, 0, 300.5);
            const rotation = 0;

            const snapped = bounds.snap(size, position, rotation);
            expect(snapped).toBeDefined();
            if (snapped) {
                expect(snapped.X).toBe(301.5);
                expect(snapped.Y).toBe(2);
                expect(snapped.Z).toBe(301.5);
            }
        });

        it("allows no-snap placement", () => {
            const size = new Vector3(3, 3, 3);
            const position = new Vector3(301.7, 0, 301.7);
            const rotation = 0;

            const snapped = bounds.snap(size, position, rotation, true);
            expect(snapped).toBeDefined();
            if (snapped) {
                expect(snapped.X).toBeCloseTo(301.7);
                expect(snapped.Z).toBeCloseTo(301.7);
            }
        });

        it("clamps position to build area bounds", () => {
            const size = new Vector3(3, 3, 3);
            const position = new Vector3(280, 0, 280); // Outside bounds
            const rotation = 0;

            const snapped = bounds.snap(size, position, rotation);
            expect(snapped).toBeDefined();
            if (snapped) {
                expect(snapped.X).toBeCloseTo(286.5);
                expect(snapped.Z).toBeCloseTo(286.5);
            }
        });

        it("handles rotation with snapping", () => {
            const size = new Vector3(6, 3, 3);
            const position = new Vector3(300, 0, 300);
            const rotation = math.rad(90);

            const snapped = bounds.snap(size, position, rotation);
            expect(snapped).toBeDefined();
            if (snapped) {
                // The snap method applies: CFrame.Angles(-math.pi/2, rotation, 0)
                // Due to gimbal lock at pitch=-90°, we need to check the actual orientation
                // by comparing the LookVector or using a different approach
                const zeroRotSnapped = bounds.snap(size, position, 0);
                expect(zeroRotSnapped).toBeDefined();

                // Verify that rotating produces a different CFrame
                if (zeroRotSnapped) {
                    const isDifferent =
                        !snapped.Position.FuzzyEq(zeroRotSnapped.Position, 0.01) ||
                        !snapped.LookVector.FuzzyEq(zeroRotSnapped.LookVector, 0.01);
                    expect(isDifferent).toBe(true);
                }
            }
        });

        it("handles negative rotation angles", () => {
            const size = new Vector3(3, 3, 3);
            const position = new Vector3(0, 0, 0);
            const rotation = -math.rad(45);

            const snapped = bounds.snap(size, position, rotation);
            expect(snapped).toBeDefined();
        });

        it("accounts for rotated item size when snapping", () => {
            const size = new Vector3(9, 3, 3); // 9x3x3 item
            const position = new Vector3(300, 0, 300); // Grid center in world space
            const rotation = math.rad(90); // Rotated 90 degrees, so 3x3x9 in world space

            const snapped = bounds.snap(size, position, rotation);
            expect(snapped).toBeDefined();
            if (snapped) {
                // Item should fit within bounds even when rotated
                const isInside = bounds.isInside(snapped.Position);
                expect(isInside).toBe(true);
            }
        });
    });

    describe("Boundary Validation", () => {
        let bounds: BuildBounds;

        beforeEach(() => {
            bounds = new BuildBounds(gridPart);
        });

        it("validates position inside bounds", () => {
            const position = new Vector3(300, 0, 300); // Grid center
            expect(bounds.isInside(position)).toBe(true);
        });

        it("validates position outside bounds", () => {
            const position = new Vector3(100, 0, 100);
            expect(bounds.isInside(position)).toBe(false);
        });

        it("validates position at edge of bounds", () => {
            const edgePosition = new Vector3(315, 0, 315); // At edge of 30x30 grid centered at 300,300
            expect(bounds.isInside(edgePosition)).toBe(true);
        });

        it("validates position just outside bounds", () => {
            const outsidePosition = new Vector3(316, 0, 316); // Just outside 30x30 grid
            expect(bounds.isInside(outsidePosition)).toBe(false);
        });

        it("validates part completely inside bounds", () => {
            const part = new Instance("Part");
            part.Size = new Vector3(3, 3, 3);
            part.Position = new Vector3(300, 0, 300); // Grid center
            expect(bounds.isCompletelyInside(part)).toBe(true);
            part.Destroy();
        });

        it("validates part partially outside bounds", () => {
            const part = new Instance("Part");
            part.Size = new Vector3(3, 3, 3);
            part.Position = new Vector3(314, 0, 314); // Partially outside
            expect(bounds.isCompletelyInside(part)).toBe(false);
            part.Destroy();
        });

        it("validates part completely outside bounds", () => {
            const part = new Instance("Part");
            part.Size = new Vector3(3, 3, 3);
            part.Position = new Vector3(100, 0, 100);
            expect(bounds.isCompletelyInside(part)).toBe(false);
            part.Destroy();
        });

        it("validates large part in small bounds", () => {
            const part = new Instance("Part");
            part.Size = new Vector3(50, 50, 50); // Larger than bounds
            part.Position = new Vector3(300, 0, 300); // Grid center
            expect(bounds.isCompletelyInside(part)).toBe(false);
            part.Destroy();
        });
    });

    describe("Edge Cases", () => {
        it("handles zero-sized grid", () => {
            const emptyGrid = new Instance("Part");
            emptyGrid.Size = new Vector3(0, 0, 0);
            emptyGrid.Parent = Workspace;

            const bounds = new BuildBounds(emptyGrid);
            expect(bounds.canvasSize).toBeDefined();
            emptyGrid.Destroy();
        });

        it("handles very large grid", () => {
            const largeGrid = new Instance("Part");
            largeGrid.Size = new Vector3(1000, 1, 1000);
            largeGrid.Parent = Workspace;

            const bounds = new BuildBounds(largeGrid);
            expect(bounds.canvasSize).toBeDefined();
            largeGrid.Destroy();
        });

        it("handles rotation at 360-degree intervals", () => {
            const bounds = new BuildBounds(gridPart);
            const size = new Vector3(3, 3, 3);
            const position = new Vector3(300, 0, 300); // Grid center

            const snap0 = bounds.snap(size, position, 0);
            const snap360 = bounds.snap(size, position, math.rad(360));

            expect(snap0).toBeDefined();
            expect(snap360).toBeDefined();
        });

        it("handles multiple rapid snap calls", () => {
            const bounds = new BuildBounds(gridPart);
            const size = new Vector3(3, 3, 3);

            for (let i = 0; i < 100; i++) {
                const position = new Vector3(300 + (i % 10), 0, 300 + (i % 10));
                const snapped = bounds.snap(size, position, 0);
                expect(snapped).toBeDefined();
            }
        });

        it("handles grid position changes", () => {
            const bounds = new BuildBounds(gridPart);
            const originalPos = gridPart.Position;

            gridPart.Position = new Vector3(50, 0, 50);
            const size = new Vector3(3, 3, 3);
            const snapped = bounds.snap(size, new Vector3(50, 0, 50), 0);
            expect(snapped).toBeDefined();

            gridPart.Position = originalPos;
        });
    });

    describe("Altitude Calculation", () => {
        let bounds: BuildBounds;

        beforeEach(() => {
            bounds = new BuildBounds(gridPart);
        });

        it("adjusts altitude for item height", () => {
            const tallSize = new Vector3(3, 10, 3);
            const shortSize = new Vector3(3, 3, 3);
            const position = new Vector3(300, 0, 300); // Grid center

            const tallSnap = bounds.snap(tallSize, position, 0);
            const shortSnap = bounds.snap(shortSize, position, 0);

            expect(tallSnap).toBeDefined();
            expect(shortSnap).toBeDefined();
            if (tallSnap && shortSnap) {
                // Taller item should have different Y position
                expect(tallSnap.Position.Y).never.toBe(shortSnap.Position.Y);
            }
        });

        it("handles unbounded positions with altitude offset", () => {
            const size = new Vector3(3, 3, 3);
            const unboundedPosition = new Vector3(100, 50, 100);

            const snapped = bounds.snap(size, unboundedPosition, 0);
            expect(snapped).toBeDefined();
            if (snapped) {
                // Unbounded position should use altitude offset
                expect(snapped.Position.Y).never.toBe(unboundedPosition.Y);
            }
        });

        it("maintains grid altitude within bounds", () => {
            const size = new Vector3(3, 3, 3);
            const position = new Vector3(300, 0, 300); // Grid center

            const snapped = bounds.snap(size, position, 0);
            expect(snapped).toBeDefined();
            if (snapped) {
                const altitude = bounds.canvasAltitude;
                expect(altitude).toBeDefined();
            }
        });
    });
});
