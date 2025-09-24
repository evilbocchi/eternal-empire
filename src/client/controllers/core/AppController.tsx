import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { ReplicatedStorage } from "@rbxts/services";
import App from "client/ui/components/App";
import eat from "shared/hamster/eat";

@Controller()
export default class AppController implements OnStart {
    onStart() {
        const container = new Instance("Folder");
        container.Name = "AppContainer";
        container.Parent = ReplicatedStorage;
        const root = createRoot(container);
        root.render(<App viewportsEnabled={true} />);
        eat(() => {
            root.unmount();
            container.Destroy();
        });
    }
}
