import { setInstanceInfo } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import Packets from "shared/Packets";
import { getAsset } from "shared/asset/AssetMap";
import { PLACED_ITEMS_FOLDER } from "shared/constants";

function BrokenItemIndicator({ model }: { model: Model }) {
    const primaryPart = model.PrimaryPart;
    const imageLabelRef = useRef<ImageLabel>();

    useEffect(() => {
        let active = true;
        const loop = () => {
            if (!active) return;
            if (imageLabelRef.current === undefined) return;
            const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut);
            TweenService.Create(imageLabelRef.current, tweenInfo, {
                ImageColor3: Color3.fromRGB(255, 156, 156),
            }).Play();
            task.wait(1);

            if (imageLabelRef.current === undefined) return;
            TweenService.Create(imageLabelRef.current, tweenInfo, {
                ImageColor3: Color3.fromRGB(255, 255, 255),
            }).Play();
            task.wait(1);

            loop();
        };
        task.delay(1, loop);

        return () => {
            active = false;
        };
    }, []);

    if (primaryPart === undefined) return <Fragment />;

    return (
        <Fragment>
            <highlight
                Adornee={model}
                FillColor={Color3.fromRGB(255, 0, 0)}
                FillTransparency={0.9}
                OutlineTransparency={1}
            />
            <billboardgui
                Adornee={primaryPart}
                Active={true}
                AlwaysOnTop={true}
                Enabled={true}
                LightInfluence={0}
                MaxDistance={80}
                Size={new UDim2(2, 0, 2, 0)}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <imagelabel
                    ref={imageLabelRef}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/Broken.png")}
                    Size={new UDim2(1, 0, 1, 0)}
                />
            </billboardgui>
        </Fragment>
    );
}

export default function BrokenItemIndicatorRenderer() {
    const [models, setModels] = useState<Set<Model>>(new Set());

    useEffect(() => {
        const connection = Packets.brokenPlacedItems.observe((brokenPlacedItems) => {
            for (const model of models) {
                if (!brokenPlacedItems.has(model.Name)) {
                    setInstanceInfo(model, "Broken", undefined);
                }
            }

            const newModels = new Set<Model>();
            for (const placementId of brokenPlacedItems) {
                const model = PLACED_ITEMS_FOLDER.WaitForChild(placementId, 1);
                if (model === undefined) continue;

                newModels.add(model as Model);
                setInstanceInfo(model, "Broken", true);
            }
            setModels(newModels);
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

    return (
        <Fragment>
            {[...models].map((model) => (
                <BrokenItemIndicator model={model} />
            ))}
        </Fragment>
    );
}
