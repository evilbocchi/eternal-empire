import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import React, { useEffect, useRef } from "@rbxts/react";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import { balanceOptionImagePerCurrency } from "client/components/balance/BalanceOption";
import displayBalanceCurrency from "client/components/balance/displayBalanceCurrency";
import { PingManager } from "client/components/stats/StatsWindow";
import { UISignals } from "shared/api/APIExpose";
import UserGameSettings from "shared/api/UserGameSettings";
import { getSound, SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { RobotoSlabExtraBold } from "shared/asset/GameFonts";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Droplet from "shared/item/Droplet";
import Packets from "shared/Packets";

/**
 * Creates and animates a currency gain element imperatively for better performance
 */
function createCurrencyGain(
    parent: GuiObject,
    currency: Currency,
    amount: BaseOnoeNum,
    start: Vector3,
    offsetIndex: number,
) {
    const details = CURRENCY_DETAILS[currency];

    // Create the main frame
    const frame = new Instance("Frame");
    frame.AnchorPoint = new Vector2(0.5, 0.5);
    frame.AutomaticSize = Enum.AutomaticSize.XY;
    frame.BackgroundTransparency = 1;
    frame.Parent = parent;

    // Create the currency image
    const imageLabel = new Instance("ImageLabel");
    imageLabel.AnchorPoint = new Vector2(0, 0.5);
    imageLabel.BackgroundTransparency = 1;
    imageLabel.Image = details.image;
    imageLabel.LayoutOrder = 2;
    imageLabel.Size = new UDim2(0, 20, 0, 20);
    imageLabel.ZIndex = 4;
    imageLabel.Parent = frame;

    // Create the currency amount text
    const textLabel = new Instance("TextLabel");
    textLabel.AutomaticSize = Enum.AutomaticSize.X;
    textLabel.BackgroundTransparency = 1;
    textLabel.Font = Enum.Font.Unknown;
    textLabel.FontFace = RobotoSlabExtraBold;
    textLabel.Size = new UDim2(0, 0, 0, 20);
    textLabel.Text = displayBalanceCurrency(currency, new OnoeNum(amount));
    textLabel.TextColor3 = details.color;
    textLabel.TextScaled = true;
    textLabel.TextSize = 14;
    textLabel.TextWrapped = true;
    textLabel.Parent = frame;

    // Create the text stroke
    const stroke = new Instance("UIStroke");
    stroke.Thickness = 2;
    stroke.Parent = textLabel;

    // Create the layout
    const layout = new Instance("UIListLayout");
    layout.FillDirection = Enum.FillDirection.Horizontal;
    layout.Padding = new UDim(0, 3);
    layout.SortOrder = Enum.SortOrder.LayoutOrder;
    layout.VerticalAlignment = Enum.VerticalAlignment.Center;
    layout.Parent = frame;

    // Set up cleanup
    Debris.AddItem(frame, 1);

    // Position the frame
    frame.Position = UDim2.fromOffset(start.X, start.Y + offsetIndex * 20);

    // Get destination for animation
    const balanceOptionImage = balanceOptionImagePerCurrency.get(currency) ?? balanceOptionImagePerCurrency.get("none");
    if (balanceOptionImage === undefined) return;
    const destination = balanceOptionImage.AbsolutePosition.add(balanceOptionImage.AbsoluteSize.div(2));

    // Create and play animation
    const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quart, Enum.EasingDirection.In);

    TweenService.Create(frame, tweenInfo, {
        Position: UDim2.fromOffset(destination.X, destination.Y),
        Rotation: frame.Rotation + math.random(-45, 45),
    }).Play();

    // Animate transparency if quality is high enough
    if (UserGameSettings!.SavedQualityLevel.Value > 5) {
        TweenService.Create(imageLabel, tweenInfo, { ImageTransparency: 1 }).Play();
        TweenService.Create(textLabel, tweenInfo, { TextTransparency: 1 }).Play();
        TweenService.Create(stroke, tweenInfo, { Transparency: 1 }).Play();
    }
}

export function CurrencyGainManager() {
    const containerRef = useRef<Frame>();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const showCurrencyGain = (at: Vector3 | undefined, amountPerCurrency: BaseCurrencyMap) => {
            const camera = Workspace.CurrentCamera;
            if (camera === undefined) return;
            let location: Vector3;
            if (at) {
                if (at.sub(camera.CFrame.Position).Magnitude > 50) {
                    return;
                }
                const [loc, withinBounds] = camera.WorldToScreenPoint(at);
                if (!withinBounds) return;
                location = loc;
            } else {
                location = new Vector3(camera.ViewportSize.X / 2, camera.ViewportSize.Y / 2, 0);
            }
            // Create currency gains directly without React components
            let index = 0;
            for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
                const amount = amountPerCurrency.get(currency);
                if (amount === undefined || new OnoeNum(amount).lessEquals(0)) continue;

                createCurrencyGain(container, currency, amount, location, index);
                index++;
            }
        };

        const connection = UISignals.showCurrencyGain.connect(showCurrencyGain);
        const gainConnection = Packets.dropletBurnt.fromServer((dropletModelId, amountPerCurrency) => {
            const dropletModel = Droplet.MODEL_PER_SPAWN_ID.get(dropletModelId);
            if (dropletModel === undefined) {
                return;
            }

            const t = os.clock();
            let burnSound: Sound;
            const sizeMagnitude = dropletModel.Size.Magnitude / 2;
            const tweenInfo = new TweenInfo(sizeMagnitude / 2);

            const light = dropletModel.FindFirstChildOfClass("PointLight") as PointLight | undefined;
            if (light !== undefined) {
                TweenService.Create(light, tweenInfo, { Range: 0 }).Play();
                burnSound = getSound("LuckyDropletBurn.mp3");
            } else {
                burnSound = getSound("DropletBurn.mp3");
            }

            burnSound.PlaybackSpeed = (math.random() * 0.3 + 0.85) / sizeMagnitude;
            if (sizeMagnitude > 0.666) {
                const reverb = new Instance("ReverbSoundEffect");
                reverb.DecayTime = sizeMagnitude / 2;
                reverb.DryLevel = 0.5;
                reverb.WetLevel = 0.5;
                reverb.Parent = burnSound;
            }
            burnSound.SoundGroup = SOUND_EFFECTS_GROUP;
            burnSound.Parent = dropletModel;
            burnSound.Play();
            TweenService.Create(dropletModel, tweenInfo, { Color: new Color3(), Size: new Vector3() }).Play();

            Debris.AddItem(dropletModel, 6);
            dropletModel.Anchored = true; // NOTE: causes desync, server sees it stop without even touching lava

            PingManager.logPing(os.clock() - t);

            showCurrencyGain(dropletModel.Position, amountPerCurrency);
        });

        return () => {
            connection.Disconnect();
            gainConnection.Disconnect();
        };
    }, []);

    return <frame ref={containerRef} BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} ZIndex={1000} />;
}
