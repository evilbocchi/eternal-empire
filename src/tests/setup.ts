import { infoPerInstance, setInfoPerInstanceMap } from "@antivivi/vrldk";
import { beforeAll, beforeEach, expect, jest } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import manuallyIgniteFlamework from "shared/hamster/manuallyIgniteFlamework";
import Sandbox from "shared/Sandbox";

declare global {
    interface _G {
        /**
         * To cut on test startup time, we only want to start up the game context once per test run.
         * We store the game context here to reuse between test suites.
         */
        testGameContext?: {
            server: Server;
            infoPerInstance: Map<Instance, InstanceInfo>;
        };
    }

    /**
     * A standard response structure for API calls.
     */
    interface APIResponse {
        /**
         * Indicates whether the API call was successful.
         */
        success: boolean;
        /**
         * Optional reason for failure if the call was not successful, or additional info if needed.
         */
        message?: string;
    }
}

declare module "@rbxts/jest-globals" {
    namespace jest {
        interface Matchers<R, T = {}> {
            /**
             * Custom matcher to check if an OnoeNum equals the expected value.
             * @param expected The expected value (can be a number or OnoeNum)
             */
            toEqualOnoeNum: (expected: number | OnoeNum) => R;

            /**
             * Custom matcher to check if a response indicates success.
             */
            toBeSuccessful: () => R;
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
    toBeSuccessful(response: APIResponse) {
        const pass = response.success === true;
        return {
            pass,
            message: () =>
                pass
                    ? "Expected call to fail but it succeeded"
                    : `Expected call to succeed but failed: ${response.message}`,
        };
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

beforeEach(() => {
    const existingNpcFolder = Workspace.FindFirstChild("NPCs") as Folder | undefined;
    if (existingNpcFolder === undefined) {
        const npcFolder = new Instance("Folder") as Folder;
        npcFolder.Name = "NPCs";
        npcFolder.Parent = Workspace;
    }

    // The sandbox has items placed around y=0 by default, so to avoid interference
    // we relocate baseplate to somewhere far below the sandbox items.
    if (Sandbox.baseplate && Sandbox.baseplateBounds) {
        Sandbox.baseplate.Position = new Vector3(0, -500, 0);
        Sandbox.baseplateBounds.draw(Sandbox.baseplate);
    }
});

beforeAll(async () => {
    if (_G.testGameContext) {
        // Recover from previous suite
        for (const [key, value] of pairs(_G.testGameContext.server)) {
            (Server as unknown as { [key: string]: unknown })[key] = value;
        }
        setInfoPerInstanceMap(_G.testGameContext.infoPerInstance);
    } else {
        // Start game
        manuallyIgniteFlamework();
        _G.testGameContext = {
            server: Server,
            infoPerInstance: infoPerInstance,
        };
    }

    Server.Data.softWipe();
});
