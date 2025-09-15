import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import React, { Fragment, useEffect, useRef } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { Debris, Players, TweenService, Workspace } from "@rbxts/services";
import { BalanceOptionManager } from "client/ui/components/balance/BalanceOption";
import displayBalanceCurrency from "client/ui/components/balance/displayBalanceCurrency";
import { RobotoSlabExtraBold } from "client/ui/GameFonts";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import ItemUtils from "shared/item/ItemUtils";
import Packets from "shared/Packets";

export default function CurrencyGain({
    currency,
    amount,
    start,
    offsetIndex,
}: {
    currency: Currency;
    amount: BaseOnoeNum;
    start: Vector3;
    offsetIndex: number;
}) {
    const frameRef = useRef<Frame>();
    const imageLabelRef = useRef<ImageLabel>();
    const textLabelRef = useRef<TextLabel>();
    const strokeRef = useRef<UIStroke>();
    const details = CURRENCY_DETAILS[currency];

    useEffect(() => {
        const frame = frameRef.current;
        const imageLabel = imageLabelRef.current;
        const textLabel = textLabelRef.current;
        const stroke = strokeRef.current;
        if (frame === undefined || imageLabel === undefined || textLabel === undefined || stroke === undefined) return;

        Debris.AddItem(frame, 1);
        const size = frame.AbsoluteSize;
        frame.Position = UDim2.fromOffset(start.X - size.X / 2, start.Y + offsetIndex * 20 + size.Y / 2);

        const balanceOptionImage = BalanceOptionManager.imagePerCurrency.get(currency);
        if (balanceOptionImage === undefined) return;
        const destination = balanceOptionImage.AbsolutePosition.add(balanceOptionImage.AbsoluteSize.div(2));

        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quart, Enum.EasingDirection.In);

        TweenService.Create(frame, tweenInfo, {
            Position: UDim2.fromOffset(destination.X, destination.Y),
            Rotation: frame.Rotation + math.random(-45, 45),
        }).Play();

        if (ItemUtils.UserGameSettings!.SavedQualityLevel.Value > 5) {
            TweenService.Create(imageLabel, tweenInfo, { ImageTransparency: 1 }).Play();
            TweenService.Create(textLabel, tweenInfo, { TextTransparency: 1 }).Play();
            TweenService.Create(stroke, tweenInfo, { Transparency: 1 }).Play();
        }
    }, []);

    return (
        <frame ref={frameRef} AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1}>
            <imagelabel
                ref={imageLabelRef}
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                Image={details.image}
                LayoutOrder={2}
                Size={new UDim2(0, 20, 0, 20)}
                ZIndex={4}
            />
            <textlabel
                ref={textLabelRef}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={RobotoSlabExtraBold}
                Size={new UDim2(0, 0, 0, 20)}
                Text={displayBalanceCurrency(currency, new OnoeNum(amount))}
                TextColor3={details.color}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke ref={strokeRef} Thickness={2} />
            </textlabel>
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                Padding={new UDim(0, 3)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
        </frame>
    );
}

export function CurrencyBundleGain({ currencyBundle, start }: { currencyBundle: CurrencyBundle; start: Vector3 }) {
    const currencyGainElements = new Array<JSX.Element>();
    let index = 0;
    for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
        const amount = currencyBundle.get(currency);
        if (amount === undefined || amount.lessEquals(0)) continue;
        currencyGainElements.push(
            <CurrencyGain currency={currency} amount={amount} start={start} offsetIndex={index} />,
        );
        index++;
    }

    return <Fragment>{currencyGainElements}</Fragment>;
}

export function CurrencyGainManager() {
    const [currencyGainInfos, setCurrencyGainInfos] = React.useState<
        Set<{ currencyBundle: CurrencyBundle; location: Vector3 }>
    >(new Set());

    useEffect(() => {
        const showCurrencyGain = (at: Vector3, amountPerCurrency: Map<Currency, BaseOnoeNum>) => {
            const camera = Workspace.CurrentCamera;
            if (camera === undefined) return;
            if (at.sub(camera.CFrame.Position).Magnitude > 50) {
                return;
            }
            const [location, withinBounds] = camera.WorldToScreenPoint(at);
            if (!withinBounds) return;

            const currencyBundle = new CurrencyBundle();
            for (const [currency, amount] of pairs(amountPerCurrency)) {
                currencyBundle.set(currency, new OnoeNum(amount));
            }
            const currencyGainInfo = { currencyBundle, location };
            currencyGainInfos.add(currencyGainInfo);
            task.delay(1, () => {
                currencyGainInfos.delete(currencyGainInfo);
                setCurrencyGainInfos(currencyGainInfos);
            });
            setCurrencyGainInfos(currencyGainInfos);
        };
        ItemUtils.showCurrencyGain = showCurrencyGain;

        const gainConnection = Packets.dropletBurnt.fromServer((dropletModelId, amountPerCurrency) => {
            const dropletModel = DROPLET_STORAGE.FindFirstChild(dropletModelId) as BasePart | undefined;
            if (dropletModel === undefined) {
                return;
            }
            showCurrencyGain(dropletModel.Position, amountPerCurrency);
        });

        return () => {
            ItemUtils.showCurrencyGain = undefined;
            gainConnection.Disconnect();
        };
    }, []);

    return (
        <Fragment>
            {[...currencyGainInfos].map((info, index) => (
                <CurrencyBundleGain key={index} currencyBundle={info.currencyBundle} start={info.location} />
            ))}
        </Fragment>
    );
}
