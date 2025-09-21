/// <reference types="@rbxts/testez/globals" />

import DataService from "server/services/data/DataService";
import { LeaderboardService } from "server/services/leaderboard/LeaderboardService";

export = function () {
    describe("Level Leaderboard", () => {
        const dataService = new DataService();
        const leaderboardService = new LeaderboardService(dataService);

        it("has a level store", () => {
            expect(leaderboardService.levelStore).to.be.ok();
            expect(typeIs(leaderboardService.levelStore, "Instance")).to.equal(true);
        });

        it("can create leaderboard service with level store", () => {
            expect(leaderboardService).to.be.ok();
        });
    });
};
