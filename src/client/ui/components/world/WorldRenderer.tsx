import React, { Fragment } from "@rbxts/react";
import { ChangelogGui } from "client/ui/components/changelog/Changelog";
import AreaBoardRenderer from "client/ui/components/world/area/AreaBoardRenderer";
import DarkMatterGui from "client/ui/components/world/DarkMatterGui";
import FundsBombsBoardGui from "client/ui/components/world/FundsBombsBoardGui";
import ResetBoardRenderer from "client/ui/components/world/reset/ResetBoardRenderer";

export default function WorldRenderer() {
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
