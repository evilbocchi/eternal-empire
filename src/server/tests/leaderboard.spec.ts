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

describe("Level Leaderboard", () => {
    it("has a level store", () => {
        expect(Server.Leaderboard.levelStore).toBeDefined();
        expect(typeIs(Server.Leaderboard.levelStore, "Instance")).toBe(true);
    });

    it("can create leaderboard service with level store", () => {
        expect(Server.Leaderboard).toBeDefined();
    });

    it("tracks banned user ids for filtering", () => {
        expect(Server.Leaderboard.banned.size() > 0).toBe(true);
        expect(Server.Leaderboard.banned.includes(1900444407)).toBe(true);
    });
});
