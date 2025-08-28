/// <reference types="@rbxts/testez/globals" />

/**
 * Tests for the React InventoryWindow component
 */

import React from "@rbxts/react";
import InventoryWindow from "shared/ui/components/inventory/InventoryWindow";

export = function () {
    describe("InventoryWindow Component", () => {
        it("can be instantiated", () => {
            const component = React.createElement(InventoryWindow, {
                visible: false,
                onVisibilityChange: () => {}
            });
            expect(component).to.be.ok();
        });

        it("returns undefined when not visible", () => {
            const component = InventoryWindow({
                visible: false,
                onVisibilityChange: () => {}
            });
            expect(component).to.equal(undefined);
        });

        it("returns a React element when visible", () => {
            const component = InventoryWindow({
                visible: true,
                onVisibilityChange: () => {}
            });
            expect(component).to.be.ok();
            expect(typeOf(component)).to.equal("table");
        });

        it("accepts build controller prop", () => {
            // Mock build controller
            const mockBuildController = {
                getRestricted: () => false,
                addPlacingModel: () => ({}),
                mainSelect: () => {},
            } as any;

            const component = InventoryWindow({
                visible: true,
                onVisibilityChange: () => {},
                buildController: mockBuildController
            });
            expect(component).to.be.ok();
        });

        it("accepts inventory controller prop", () => {
            // Mock inventory controller  
            const mockInventoryController = {
                getBest: () => undefined,
                handleItemClick: () => true,
            } as any;

            const component = InventoryWindow({
                visible: true,
                onVisibilityChange: () => {},
                inventoryController: mockInventoryController
            });
            expect(component).to.be.ok();
        });
    });
};