/// <reference types="@rbxts/testez/globals" />
import { Janitor } from "@rbxts/janitor";
import { Server } from "shared/api/APIExpose";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
        mockFlamework();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
    });

    describe("Level Leaderboard", () => {
        it("has a level store", () => {
            expect(Server.Leaderboard.levelStore).to.be.ok();
            expect(typeIs(Server.Leaderboard.levelStore, "Instance")).to.equal(true);
        });

        it("can create leaderboard service with level store", () => {
            expect(Server.Leaderboard).to.be.ok();
        });

        it("tracks banned user ids for filtering", () => {
            expect(Server.Leaderboard.banned.size() > 0).to.equal(true);
            expect(Server.Leaderboard.banned.includes(1900444407)).to.equal(true);
        });
    });
};
