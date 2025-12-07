import { describe, expect, it } from "@rbxts/jest-globals";
import { Server } from "shared/api/APIExpose";

describe("LeaderboardChangeService", () => {
    it("creates successfully", () => {
        expect(Server.LeaderboardChange).toBeDefined();
    });

    it("empire data has leaderboard positions map", () => {
        expect(Server.Data.empireData.leaderboardPositions).toBeDefined();
        expect(typeIs(Server.Data.empireData.leaderboardPositions, "Instance")).toBe(false);
    });

    it("registers multiple leaderboard stores", () => {
        const stores = Server.LeaderboardChange.leaderboardStores;
        expect(stores).toBeDefined();
        expect(stores.size()).toBeGreaterThanOrEqual(2);
    });
});
