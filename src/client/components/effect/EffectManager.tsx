import React, { Fragment } from "@rbxts/react";
import AreaEffectManager from "client/components/effect/AreaEffectManager";
import ChatHookManager from "client/components/effect/ChatHookManager";
import ClickSparkManager from "client/components/effect/ClickSparkManager";
import DropletSurgeManager from "client/components/effect/DropletSurgeManager";
import EyeContactManager from "client/components/effect/EyeContactManager";
import HamsterManager from "client/components/effect/HamsterManager";
import ItemEffectManager from "client/components/effect/ItemEffectManager";
import LightingAtmosphereManager from "client/components/effect/LightingAtmosphereManager";
import WalkspeedManager from "client/components/effect/WalkspeedManager";
import EtohKitClientManager from "client/components/effect/etoh/EtohKitClientManager";

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
            <EtohKitClientManager />
            <EyeContactManager />
            <WalkspeedManager />
        </Fragment>
    );
}
