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

    describe("LeaderboardChangeService", () => {
        it("creates successfully", () => {
            expect(Server.LeaderboardChange).to.be.ok();
        });

        it("empire data has leaderboard positions map", () => {
            expect(Server.Data.empireData.leaderboardPositions).to.be.ok();
            expect(typeIs(Server.Data.empireData.leaderboardPositions, "Instance")).to.equal(false);
        });

        it("registers multiple leaderboard stores", () => {
            const stores = Server.LeaderboardChange["leaderboardStores"] as Map<string, OrderedDataStore>;
            expect(stores).to.be.ok();
            expect(stores.size() >= 2).to.equal(true);
        });
    });
};
