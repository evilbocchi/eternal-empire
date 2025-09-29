import React, { Fragment } from "@rbxts/react";
import ClickSparkManager from "client/components/effect/ClickSparkManager";
import DropletSurgeManager from "client/components/effect/DropletSurgeManager";

export default function EffectManager() {
    return (
        <Fragment>
            <ClickSparkManager />
            <DropletSurgeManager />
        </Fragment>
    );
}
