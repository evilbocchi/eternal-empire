import { Janitor } from "@rbxts/janitor";
import { afterAll, beforeAll, describe, expect, it } from "@rbxts/jest-globals";
import { Server } from "shared/api/APIExpose";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";

beforeAll(() => {
    eater.janitor = new Janitor();
    mockFlamework();
});

afterAll(() => {
    eater.janitor?.Destroy();
});

describe("LeaderboardChangeService", () => {
    it("creates successfully", () => {
        expect(Server.LeaderboardChange).toBeDefined();
    });

    it("empire data has leaderboard positions map", () => {
        expect(Server.Data.empireData.leaderboardPositions).toBeDefined();
        expect(typeIs(Server.Data.empireData.leaderboardPositions, "Instance")).toBe(false);
    });

    it("registers multiple leaderboard stores", () => {
        const stores = Server.LeaderboardChange["leaderboardStores"] as Map<string, OrderedDataStore>;
        expect(stores).toBeDefined();
        expect(stores.size() >= 2).toBe(true);
    });
});
