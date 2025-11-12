import { describe, expect, it } from "@rbxts/jest-globals";
import { Server } from "shared/api/APIExpose";

describe("Level Leaderboard", () => {
    it("tracks banned user ids for filtering", () => {
        expect(Server.Leaderboard.banned.size() > 0).toBe(true);
        expect(Server.Leaderboard.banned.includes(1900444407)).toBe(true);
    });
});
