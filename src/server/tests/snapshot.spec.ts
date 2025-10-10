/// <reference types="@rbxts/testez/globals" />
import { Janitor } from "@rbxts/janitor";
import { Workspace } from "@rbxts/services";
import { eater } from "shared/hamster/eat";
import { captureSnapshot, restoreSnapshot, clearAllSnapshots } from "shared/hamster/snapshot";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
        clearAllSnapshots();
    });

    describe("snapshot system", () => {
        it("captures and restores BasePart properties", () => {
            const part = new Instance("Part");
            part.Parent = Workspace;
            part.Transparency = 0;
            part.CanCollide = true;
            part.Anchored = false;

            // Capture snapshot
            const snapshot = captureSnapshot(part);

            // Modify properties
            part.Transparency = 0.5;
            part.CanCollide = false;
            part.Anchored = true;

            expect(part.Transparency).to.equal(0.5);
            expect(part.CanCollide).to.equal(false);
            expect(part.Anchored).to.equal(true);

            // Restore snapshot
            restoreSnapshot(snapshot);

            expect(part.Transparency).to.equal(0);
            expect(part.CanCollide).to.equal(true);
            expect(part.Anchored).to.equal(false);

            part.Destroy();
        });

        it("captures and restores ProximityPrompt properties", () => {
            const prompt = new Instance("ProximityPrompt");
            const part = new Instance("Part");
            part.Parent = Workspace;
            prompt.Parent = part;
            prompt.Enabled = false;

            // Capture snapshot
            const snapshot = captureSnapshot(prompt);

            // Modify property
            prompt.Enabled = true;
            expect(prompt.Enabled).to.equal(true);

            // Restore snapshot
            restoreSnapshot(snapshot);
            expect(prompt.Enabled).to.equal(false);

            part.Destroy();
        });

        it("captures and restores ParticleEmitter properties", () => {
            const emitter = new Instance("ParticleEmitter");
            const part = new Instance("Part");
            part.Parent = Workspace;
            emitter.Parent = part;
            emitter.Enabled = false;

            // Capture snapshot
            const snapshot = captureSnapshot(emitter);

            // Modify property
            emitter.Enabled = true;
            expect(emitter.Enabled).to.equal(true);

            // Restore snapshot
            restoreSnapshot(snapshot);
            expect(emitter.Enabled).to.equal(false);

            part.Destroy();
        });

        it("handles destroyed instances gracefully", () => {
            const part = new Instance("Part");
            part.Parent = Workspace;
            part.Transparency = 0;

            // Capture snapshot
            const snapshot = captureSnapshot(part);

            // Destroy the part
            part.Destroy();

            // Restoring should not error
            expect(() => {
                restoreSnapshot(snapshot);
            }).never.to.throw();
        });

        it("supports custom property selection", () => {
            const part = new Instance("Part");
            part.Parent = Workspace;
            part.Transparency = 0;
            part.CanCollide = true;
            part.Anchored = false;

            // Capture only transparency
            const snapshot = captureSnapshot(part, ["Transparency"]);

            // Modify all properties
            part.Transparency = 0.5;
            part.CanCollide = false;
            part.Anchored = true;

            // Restore - only transparency should revert
            restoreSnapshot(snapshot);

            expect(part.Transparency).to.equal(0);
            expect(part.CanCollide).to.equal(false); // Should remain modified
            expect(part.Anchored).to.equal(true); // Should remain modified

            part.Destroy();
        });

        it("captures CFrame properly", () => {
            const part = new Instance("Part");
            part.Parent = Workspace;
            const originalCFrame = new CFrame(0, 10, 0);
            part.CFrame = originalCFrame;

            // Capture snapshot
            const snapshot = captureSnapshot(part);

            // Modify CFrame
            const modifiedCFrame = new CFrame(50, 20, 30);
            part.CFrame = modifiedCFrame;
            expect(part.CFrame).to.equal(modifiedCFrame);

            // Restore snapshot
            restoreSnapshot(snapshot);
            expect(part.CFrame).to.equal(originalCFrame);

            part.Destroy();
        });

        it("captures Color property", () => {
            const part = new Instance("Part");
            part.Parent = Workspace;
            const originalColor = new Color3(1, 0, 0); // Red
            part.Color = originalColor;

            // Capture snapshot
            const snapshot = captureSnapshot(part);

            // Modify color
            const modifiedColor = new Color3(0, 1, 0); // Green
            part.Color = modifiedColor;
            expect(part.Color).to.equal(modifiedColor);

            // Restore snapshot
            restoreSnapshot(snapshot);
            expect(part.Color).to.equal(originalColor);

            part.Destroy();
        });
    });
};
