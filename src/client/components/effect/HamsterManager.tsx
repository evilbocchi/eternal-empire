import React, { Fragment, useEffect } from "@rbxts/react";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

export default function HamsterManager() {
    useEffect(() => {
        const connection = Packets.modifyGame.fromServer((param) => {
            if (param === "markplaceableeverywhere") {
                Items.itemsPerId.forEach((item) => item.placeableEverywhere());
            }
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

    return <Fragment />;
}
