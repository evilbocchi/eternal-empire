import React, { Fragment, useEffect } from "@rbxts/react";
import playSkillificationSequence from "client/components/reset/playSkillificationSequence";
import Packets from "shared/Packets";

export default function ResetRenderer() {
    useEffect(() => {
        const connection = Packets.reset.fromServer((layer, amount) => {
            if (layer === "Skillification") {
                playSkillificationSequence(amount);
            }
        });

        return () => connection.Disconnect();
    });
    return <Fragment />;
}
