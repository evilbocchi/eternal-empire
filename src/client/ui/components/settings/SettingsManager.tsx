import React, { Fragment } from "@rbxts/react";
import SettingsWindow, { SettingsButton } from "client/ui/components/settings/SettingsWindow";

export default function SettingsManager() {
    return (
        <Fragment>
            <SettingsWindow />
            <SettingsButton />
        </Fragment>
    );
}
