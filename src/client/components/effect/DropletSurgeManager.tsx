import React, { Fragment, useEffect } from "@rbxts/react";
import { Debris, TweenService } from "@rbxts/services";
import Droplet from "shared/item/Droplet";
import Packets from "shared/Packets";

export default function DropletSurgeManager() {
    useEffect(() => {
        const connection = Packets.dropletSurged.fromServer((dropletModelId) => {
            const droplet = Droplet.MODEL_PER_SPAWN_ID.get(dropletModelId);
            if (droplet === undefined) return;

            // Visual effect for surged droplet
            const light = new Instance("PointLight");
            light.Color = Color3.fromRGB(255, 255, 255);
            light.Brightness = 10;
            light.Range = 3;
            light.Parent = droplet;

            // Fade back to original color over time
            TweenService.Create(light, new TweenInfo(2), { Brightness: 0 }).Play();
            Debris.AddItem(light, 2);
        });

        return () => connection.Disconnect();
    }, []);

    return <Fragment />;
}
