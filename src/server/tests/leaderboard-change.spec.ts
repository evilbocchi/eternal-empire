/// <reference types="@rbxts/testez/globals" />

import DataService from "server/services/serverdata/DataService";
import LeaderboardChangeService from "server/services/leaderboard/LeaderboardChangeService";

export = function () {
    describe("LeaderboardChangeService", () => {
        let dataService: DataService;
        let leaderboardChangeService: LeaderboardChangeService;

        beforeEach(() => {
            dataService = new DataService();
            leaderboardChangeService = new LeaderboardChangeService(dataService);
        });

        it("creates successfully", () => {
            expect(leaderboardChangeService).to.be.ok();
        });

        it("empire data has leaderboard positions map", () => {
            expect(dataService.empireData.leaderboardPositions).to.be.ok();
            expect(typeIs(dataService.empireData.leaderboardPositions, "Instance")).to.equal(false);
        });
    });
};