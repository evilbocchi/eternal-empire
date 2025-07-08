/// <reference types="@rbxts/testez/globals" />
import { TestEZ } from "@rbxts/testez";
import Items from "shared/items/Items";
import UniqueItem from "shared/item/traits/UniqueItem";
import UUID from "shared/utils/UUID";

export = () => {
    describe("Unique Items Client Formatting", () => {
        it("should be able to format unique item descriptions", () => {
            // Get the first dropper booster item
            const baseItem = Items.getItem("TheFirstDropperBooster");
            expect(baseItem).to.be.ok();

            const uniqueTrait = baseItem!.findTrait("UniqueItem");
            expect(uniqueTrait).to.be.ok();

            // Generate a unique instance
            const instance = uniqueTrait!.generateInstance();
            expect(instance).to.be.ok();
            expect(instance.baseItemId).to.equal("TheFirstDropperBooster");
            expect(instance.pots.size()).to.be.greaterThan(0);

            // Test formatting with pots
            const formattedDescription = UniqueItem.formatWithPots(
                baseItem!.description,
                instance,
                uniqueTrait!
            );

            expect(formattedDescription).to.be.ok();
            expect(formattedDescription).to.not.equal(baseItem!.description);

            // Check that placeholders are replaced
            expect(formattedDescription.find("%dropRateMultiplier%")[0]).to.be.nil();
            expect(formattedDescription.find("%valueMultiplier%")[0]).to.be.nil();
            expect(formattedDescription.find("%radius%")[0]).to.be.nil();

            print("Formatted description:", formattedDescription);
        });

        it("should validate pot value ranges", () => {
            const baseItem = Items.getItem("TheFirstDropperBooster");
            const uniqueTrait = baseItem!.findTrait("UniqueItem");
            const instance = uniqueTrait!.generateInstance();

            // Check that raw pot values are in 0-100 range
            for (const [potName, rawValue] of instance.pots) {
                expect(rawValue).to.be.within(0, 100);
            }

            // Check that scaled values are within configured ranges
            const scaledPots = uniqueTrait!.getScaledPots(instance);
            const potConfigs = uniqueTrait!.getPotConfigs();

            for (const [potName, scaledValue] of scaledPots) {
                const config = potConfigs.get(potName);
                expect(config).to.be.ok();
                expect(scaledValue).to.be.within(config!.min, config!.max);
            }
        });

        it("should generate valid UUIDs", () => {
            for (let i = 0; i < 10; i++) {
                const uuid = UUID.generate();
                expect(UUID.isValid(uuid)).to.equal(true);
                expect(uuid.size()).to.equal(36); // Standard UUID length
            }
        });
    });
};