import React, { Fragment, useEffect, useState } from "@rbxts/react";
import { SkillificationGui } from "client/components/world/reset/SkillificationGui";
import WinificationGui from "client/components/world/reset/WinificationGui";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import Packets from "shared/Packets";

export default function ResetBoardRenderer() {
    const [amountLabelPerLayer, setAmountLabelPerLayer] = useState<Map<ResetLayerId, string>>(new Map());
    const [countdownPerLayer, setCountdownPerLayer] = useState<Map<ResetLayerId, number>>(new Map());

    useEffect(() => {
        const gainConnection = Packets.gainPerResetLayer.observe((gainPerResetLayer) => {
            const amountLabelPerLayer = new Map<ResetLayerId, string>();
            for (const [layer, amount] of gainPerResetLayer) {
                amountLabelPerLayer.set(layer, CurrencyBundle.getFormatted(RESET_LAYERS[layer].gives, amount));
            }
            setAmountLabelPerLayer(amountLabelPerLayer);
        });
        const countdownConnection = Packets.resetCountdown.fromServer((layer, countdown) => {
            setCountdownPerLayer((prev) => {
                prev.set(layer, countdown);
                return table.clone(prev);
            });
        });
        return () => {
            gainConnection.disconnect();
            countdownConnection.Disconnect();
        };
    }, []);

    const skillDelta = amountLabelPerLayer.get("Skillification");
    const winsDelta = amountLabelPerLayer.get("Winification");

    return (
        <Fragment>
            <SkillificationGui
                amountText={skillDelta ?? "???"}
                noticeText={
                    skillDelta
                        ? `Stand on the altar for ${countdownPerLayer.get("Skillification") ?? 0} seconds to reset`
                        : `You need ${CurrencyBundle.getFormatted(RESET_LAYERS.Skillification.scalesWith, RESET_LAYERS.Skillification.minimum)} to reset`
                }
            />
            <WinificationGui
                amountText={winsDelta ?? "???"}
                noticeText={
                    winsDelta
                        ? `Stand on the altar for ${countdownPerLayer.get("Winification") ?? 0} seconds to reset`
                        : `You need ${CurrencyBundle.getFormatted(RESET_LAYERS.Winification.scalesWith, RESET_LAYERS.Winification.minimum)} to reset`
                }
            />
        </Fragment>
    );
}
