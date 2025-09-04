import React, { Fragment } from "@rbxts/react";
import PositionManager from "client/ui/components/position/PositionManager";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";

export default function MainLayout() {
    return (
        <Fragment>
            <PositionManager />
            <TrackedQuestWindow />
            <SidebarButtons />
        </Fragment>
    );
}
