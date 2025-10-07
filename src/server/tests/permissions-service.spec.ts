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

    describe("PermissionsService", () => {
        let snapshot: {
            banned: number[];
            trusted: number[];
            managers: number[];
            owner: number;
            permLevels: { [key in PermissionKey]: number };
        };

        beforeEach(() => {
            const data = Server.Data.empireData;
            snapshot = {
                banned: [...data.banned],
                trusted: [...data.trusted],
                managers: [...data.managers],
                owner: data.owner,
                permLevels: { ...data.permLevels },
            };

            data.banned = [];
            data.trusted = [];
            data.managers = [];
            data.owner = snapshot.owner;
            data.permLevels = { ...snapshot.permLevels };
        });

        afterEach(() => {
            const data = Server.Data.empireData;
            data.banned = snapshot.banned;
            data.trusted = snapshot.trusted;
            data.managers = snapshot.managers;
            data.owner = snapshot.owner;
            data.permLevels = snapshot.permLevels;
        });

        it("adds and avoids duplicating permission list entries", () => {
            const userId = 123456;
            const added = Server.Permissions.add("trusted", userId);
            const duplicate = Server.Permissions.add("trusted", userId);

            expect(added).to.equal(true);
            expect(duplicate).to.equal(false);
            expect(Server.Permissions.getList("trusted").includes(userId)).to.equal(true);
        });

        it("removes ids from permission lists", () => {
            const userId = 98765;
            Server.Permissions.add("banned", userId);
            const removed = Server.Permissions.remove("banned", userId);

            expect(removed).to.equal(true);
            expect(Server.Permissions.getList("banned").includes(userId)).to.equal(false);
        });

        it("derives permission levels from empire data", () => {
            const ownerId = 24680;
            const trustedId = 112233;
            const bannedId = 556677;

            const data = Server.Data.empireData;
            data.owner = ownerId;
            data.trusted = [trustedId];
            data.banned = [bannedId];

            expect(Server.Permissions.getPermissionLevel(ownerId)).to.equal(3);
            expect(Server.Permissions.getPermissionLevel(trustedId)).to.equal(1);
            expect(Server.Permissions.getPermissionLevel(bannedId)).to.equal(-2);
        });

        it("formats access codes with the empire id", () => {
            const code = Server.Permissions.getAccessCode();
            const parts = code.split("|");

            expect(parts.size()).to.equal(2);
            expect(parts[1]).to.equal(Server.Data.empireId);
        });
    });
};
