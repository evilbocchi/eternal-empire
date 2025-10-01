import React, { Fragment } from "@rbxts/react";
import AreaEffectManager from "client/components/effect/AreaEffectManager";
import ClickSparkManager from "client/components/effect/ClickSparkManager";
import DropletSurgeManager from "client/components/effect/DropletSurgeManager";
import LightingAtmosphereManager from "client/components/effect/LightingAtmosphereManager";

export default function EffectManager() {
    return (
        <Fragment>
            <AreaEffectManager />
            <ClickSparkManager />
            <DropletSurgeManager />
            <LightingAtmosphereManager />
        </Fragment>
    );
}
