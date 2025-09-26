import React, { Fragment } from "@rbxts/react";
import { ChangelogGui } from "client/components/changelog/Changelog";
import AreaBoardRenderer from "client/components/world/area/AreaBoardRenderer";
import DarkMatterGui from "client/components/world/DarkMatterGui";
import FundsBombsBoardGui from "client/components/world/FundsBombsBoardGui";
import ResetBoardRenderer from "client/components/world/reset/ResetBoardRenderer";
import Sandbox from "shared/Sandbox";

export default function WorldRenderer() {
    if (Sandbox.getEnabled()) return <Fragment />;

    return (
        <Fragment>
            <AreaBoardRenderer />
            <ResetBoardRenderer />
            <ChangelogGui />
            <DarkMatterGui />
            <FundsBombsBoardGui />
        </Fragment>
    );
}
