import { afterEach, beforeEach, describe, expect, it, jest } from "@rbxts/jest-globals";
import { HttpService } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import Command, { CommandAPI } from "shared/commands/Command";

describe("PermissionsService", () => {
    let snapshot: {
        banned: number[];
        trusted: number[];
        managers: number[];
        owner: number;
        permLevels: { [key in PermissionKey]: number };
    };

    beforeEach(() => {
        const data = Server.empireData;
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
        const data = Server.empireData;
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

        expect(added).toBe(true);
        expect(duplicate).toBe(false);
        expect(Server.Permissions.getList("trusted").includes(userId)).toBe(true);
    });

    it("removes ids from permission lists", () => {
        const userId = 98765;
        Server.Permissions.add("banned", userId);
        const removed = Server.Permissions.remove("banned", userId);

        expect(removed).toBe(true);
        expect(Server.Permissions.getList("banned").includes(userId)).toBe(false);
    });

    it("derives permission levels from empire data", () => {
        const ownerId = 24680;
        const trustedId = 112233;
        const bannedId = 556677;

        const data = Server.empireData;
        data.owner = ownerId;
        data.trusted = [trustedId];
        data.banned = [bannedId];

        expect(Server.Permissions.getPermissionLevel(ownerId, true)).toBe(3);
        expect(Server.Permissions.getPermissionLevel(trustedId, true)).toBe(1);
        expect(Server.Permissions.getPermissionLevel(bannedId, true)).toBe(-2);
    });

    it("formats access codes with the empire id", () => {
        const code = Server.Permissions.getAccessCode();
        const parts = code.split("|");

        expect(parts.size()).toBe(2);
        expect(parts[1]).toBe(Server.Data.empireId);
    });

    describe("command permission access", () => {
        let player: Player;
        let userIdSeed = 1000;

        beforeEach(() => {
            const userId = userIdSeed++;
            player = {
                Name: `PermissionTester_${HttpService.GenerateGUID(false)}`,
                UserId: userId,
            } as unknown as Player;
        });

        it("denies command execution when permission level is too low", () => {
            const empireData = Server.empireData;
            empireData.trusted = [player.UserId];
            empireData.managers = [];
            empireData.owner = -1;

            let count = 0;
            const command = new Command("permtest1").setExecute(() => count++).setPermissionLevel(2);

            jest.spyOn(jest.globalEnv, "print").mockImplementation((data) => {
                expect(data).toBe("You do not have access to this command.");
            });

            CommandAPI.Command.parseCommandInvocation(command, player, `/permtest1 arg1 arg2`);

            expect(count).toBe(0);
        });

        it("executes command when permission level is sufficient", () => {
            const empireData = Server.empireData;
            empireData.owner = player.UserId;

            let calledPlayer: Player | undefined;
            let calledArgs: string[] | undefined;
            let count = 0;
            const command = new Command("permtest2")
                .setExecute((player, ...args) => {
                    calledPlayer = player;
                    calledArgs = args;
                    count++;
                })
                .setPermissionLevel(2);

            CommandAPI.Command.parseCommandInvocation(command, player, `/permtest2 arg1 arg2`);

            expect(count).toBe(1);
            expect(calledPlayer).toBe(player);
            expect(calledArgs).toEqual(["arg1", "arg2"]);
        });
    });
});
