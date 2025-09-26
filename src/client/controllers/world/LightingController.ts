import { Controller, OnStart } from "@flamework/core";
import { Lighting } from "@rbxts/services";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

@Controller()
export default class LightingController implements OnStart {
    readonly DEFAULT_LIGHTING: Partial<Lighting> = {
        Ambient: Lighting.Ambient,
        OutdoorAmbient: Lighting.OutdoorAmbient,
        EnvironmentDiffuseScale: Lighting.EnvironmentDiffuseScale,
        EnvironmentSpecularScale: Lighting.EnvironmentSpecularScale,
        FogEnd: Lighting.FogEnd,
        FogStart: Lighting.FogStart,
        FogColor: Lighting.FogColor,
        Brightness: Lighting.Brightness,
    };

    onAreaChanged() {
        const areaId = Packets.currentArea.get();
        const lightingConfig = areaId !== undefined ? AREAS[areaId]?.lightingConfiguration : undefined;
        if (lightingConfig === undefined) {
            for (const [key, value] of pairs(this.DEFAULT_LIGHTING)) {
                (Lighting as unknown as { [key: string]: unknown })[key] = value;
            }
            return;
        }

        for (const [key, value] of pairs(lightingConfig)) {
            (Lighting as unknown as { [key: string]: unknown })[key] = value;
        }
    }

    onStart() {
        Packets.currentArea.observe(() => this.onAreaChanged());
        this.onAreaChanged();
    }
}
