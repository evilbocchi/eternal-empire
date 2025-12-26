import { Janitor } from "@rbxts/janitor";
import { afterAll, beforeAll, expect, jest } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Workspace } from "@rbxts/services";
import cleanupSimulation from "shared/hamster/cleanupSimulation";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/mockFlamework";

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

// Suppress noisy console output during tests
const suppressedPrintPatterns = [
    "Weather changed to:",
    "Initialized ",
    "Weather manually set to:",
    "Automatic weather generation resumed",
    "gave shop",
    "Reached point",
];
const originalPrint = jest.globalEnv.print as unknown as (...args: unknown[]) => void;
jest.spyOn(jest.globalEnv, "print").mockImplementation((...args: unknown[]) => {
    const message = tostring(args[0]);
    const shouldSuppress = suppressedPrintPatterns.some((pattern) => message.find(pattern)[0] !== undefined);
    if (!shouldSuppress) {
        originalPrint(...args);
    }
});

beforeAll(() => {
    const existingNpcFolder = Workspace.FindFirstChild("NPCs") as Folder | undefined;
    if (existingNpcFolder === undefined) {
        const npcFolder = new Instance("Folder") as Folder;
        npcFolder.Name = "NPCs";
        npcFolder.Parent = Workspace;
    }

    eater.janitor = new Janitor();
    const cleanup = mockFlamework();
    eater.janitor.Add(cleanup);
    eater.janitor.Add(cleanupSimulation);
});

afterAll(() => eater.janitor?.Destroy());
