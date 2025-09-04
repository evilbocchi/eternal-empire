import React, { useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import InventoryWindow from "client/ui/components/inventory/InventoryWindow";
import StoryMocking from "client/ui/components/StoryMocking";

const controls = {
    visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        StoryMocking.mockData();

        const [visible, setVisible] = useState(false);
        useEffect(() => {
            setVisible(props.controls.visible);
        }, [props.controls.visible]);

        return <InventoryWindow visible={visible} onClose={() => setVisible(false)} />;
    },
};
