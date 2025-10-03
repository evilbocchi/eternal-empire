import React, { Fragment } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { DataStoreService, Players } from "@rbxts/services";
import { CreateReactStory } from "@rbxts/ui-labs";
import AvailableEmpire from "shared/data/AvailableEmpire";
import { EmpireProfileManager } from "shared/data/profile/ProfileManager";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            username: "migeru_tan",
            userId: 0,
            empireId: "EMPIREID_HERE",
            empireIndex: 0,
            copyTo: "COPIED_DATA",
        },
    },
    (props) => {
        let { username, userId, empireId, empireIndex, copyTo } = props.controls;
        if (userId === 0) {
            userId = Players.GetUserIdFromNameAsync(username);
            print(userId);
        }
        if (empireId === "EMPIREID_HERE") {
            empireId = AvailableEmpire.viewPlayerData(userId).ownedEmpires[empireIndex];
            print(empireId);
        }
        const profile = EmpireProfileManager.load(empireId, true);

        const key = EmpireProfileManager.getKey(copyTo);
        DataStoreService.GetDataStore(EmpireProfileManager.storeName).SetAsync(key, profile?.Data);
        print(`Copied data to key ${key}`);
        print(profile?.Data);

        return <Fragment />;
    },
);
