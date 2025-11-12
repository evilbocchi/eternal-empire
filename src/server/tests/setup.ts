import { FletchetteEnvironment } from "@rbxts/fletchette";
import { Janitor } from "@rbxts/janitor";
import { afterAll, beforeAll, expect } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import cleanupSimulation from "shared/hamster/cleanupSimulation";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/mockFlamework";
import Items from "shared/items/Items";

declare module "@rbxts/jest-globals" {
    namespace jest {
        interface Matchers<R, T = {}> {
            /**
             * Custom matcher to check if an OnoeNum equals the expected value.
             * @param expected The expected value (can be a number or OnoeNum)
             */
            toEqualOnoeNum: (expected: number | OnoeNum) => R;
        }
    }
}

expect.extend({
    toEqualOnoeNum(received: OnoeNum | undefined, expected: number | OnoeNum) {
        const expectedNum = new OnoeNum(expected);

        if (received === undefined) {
            return {
                pass: false,
                message: () => `expected OnoeNum but received undefined`,
            };
        }

        if (!typeIs(received, "table") || !("equals" in received)) {
            return {
                pass: false,
                message: () => `expected OnoeNum but received ${typeOf(received)}`,
            };
        }

        received = new OnoeNum(received);

        const pass = received.equals(expectedNum);

        if (pass) {
            return {
                pass: true,
                message: () => `expected ${tostring(received)} not to equal ${tostring(expectedNum)}`,
            };
        } else {
            return {
                pass: false,
                message: () => `expected ${tostring(received)} to equal ${tostring(expectedNum)}`,
            };
        }
    },
});

beforeAll(() => {
    eater.janitor = new Janitor();
    const cleanup = mockFlamework();
    eater.janitor.Add(cleanup);
    eater.janitor.Add(cleanupSimulation);
});

afterAll(() => {
    eater.janitor?.Destroy();

    for (const item of Items.sortedItems) {
        table.clear(item);
    }
    table.clear(Items);
});
