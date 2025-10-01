import React, { Fragment } from "@rbxts/react";
import AreaEffectManager from "client/components/effect/AreaEffectManager";
import ClickSparkManager from "client/components/effect/ClickSparkManager";
import DropletSurgeManager from "client/components/effect/DropletSurgeManager";
import ChatHookManager from "client/components/effect/ChatHookManager";
import EyeContactManager from "client/components/effect/EyeContactManager";
import HamsterManager from "client/components/effect/HamsterManager";
import ItemEffectManager from "client/components/effect/ItemEffectManager";
import LightingAtmosphereManager from "client/components/effect/LightingAtmosphereManager";
import WalkspeedManager from "client/components/effect/WalkspeedManager";

export default function EffectManager() {
    return (
        <Fragment>
            <AreaEffectManager />
            <ClickSparkManager />
            <DropletSurgeManager />
            <HamsterManager />
            <ItemEffectManager />
            <LightingAtmosphereManager />
            <ChatHookManager />
            <EyeContactManager />
            <WalkspeedManager />
        </Fragment>
    );
}
