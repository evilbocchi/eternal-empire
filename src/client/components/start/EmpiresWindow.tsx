import ComputeNameColor from "@antivivi/rbxnamecolor";
import { convertToHHMMSS } from "@antivivi/vrldk";
import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { Players, StarterGui } from "@rbxts/services";
import { showErrorToast } from "client/components/toast/ToastService";
import MenuOption, { BaseMenuOption } from "client/components/start/MenuOption";
import { RobotoSlab, RobotoSlabBold, RobotoSlabHeavy } from "shared/asset/GameFonts";
import useProperty from "client/hooks/useProperty";
import { playSound } from "shared/asset/GameAssets";
import { getNameFromUserId } from "shared/constants";
import Packets from "shared/Packets";
import LoadingScreen from "sharedfirst/LoadingScreen";
import { PLAYER_GUI } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";

/**
 * Individual empire option component
 */
function EmpireOption({ empireId, empireInfo }: { empireId: string; empireInfo: EmpireInfo }) {
    const [avatarImage, setAvatarImage] = useState("");

    const color = empireInfo.name
        ? (ComputeNameColor(empireInfo.name) ?? Color3.fromRGB(0, 170, 0))
        : Color3.fromRGB(0, 170, 0);

    // Load avatar asynchronously
    useEffect(() => {
        if (empireInfo.owner) {
            task.spawn(() => {
                try {
                    const [thumbnail] = Players.GetUserThumbnailAsync(
                        empireInfo.owner,
                        Enum.ThumbnailType.HeadShot,
                        Enum.ThumbnailSize.Size150x150,
                    );
                    setAvatarImage(thumbnail);
                } catch (error) {
                    warn("Failed to load avatar:", error);
                }
            });
        }
    }, [empireInfo.owner]);

    const textBorderGradient = new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(122, 122, 122)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(51, 51, 51)),
    ]);

    return (
        <BaseMenuOption
            gradientColors={[color, color.Lerp(Color3.fromRGB(0, 0, 0), 0.5)]}
            size={new UDim2(0.12, 500, 0, 120)}
            onClick={() => {
                playSound("MenuClick.mp3");
                let screenGui: ScreenGui | undefined;
                if (IS_EDIT) {
                    screenGui = new Instance("ScreenGui");
                    screenGui.IgnoreGuiInset = true;
                    screenGui.ResetOnSpawn = false;
                    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
                    screenGui.Parent = StarterGui;
                    eat(screenGui, "Destroy");
                }
                LoadingScreen.showLoadingScreen("", false, screenGui);
                const [success, result] = pcall(() => Packets.teleportToEmpire.toServer(empireId));
                if (!success || !result) {
                    LoadingScreen.hideLoadingScreen();
                    showErrorToast(`Failed to join empire: ${result ?? "Unknown error"}`);
                    playSound("Error.mp3");
                }
            }}
            fast={true}
        >
            <frame BackgroundTransparency={1} Size={new UDim2(0.65, 0, 1, 0)}>
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    Padding={new UDim(0.05, 0)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <imagelabel
                    BackgroundTransparency={1}
                    Image={avatarImage}
                    Size={new UDim2(0.75, 0, 0.75, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />
                <frame BackgroundTransparency={1} Size={new UDim2(0.65, 0, 1, -10)}>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />
                    <textlabel
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.25, 0)}
                        Size={new UDim2(1, 0, 0.4, 0)}
                        Text={empireInfo.name}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Color={color} Thickness={3}>
                            <uigradient Color={textBorderGradient} Rotation={90} />
                        </uistroke>
                    </textlabel>
                    <textlabel
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0, 0)}
                        Size={new UDim2(1, 0, 0.25, 0)}
                        Text={
                            empireInfo.owner ? "Owned by " + getNameFromUserId(empireInfo.owner) : "could not load info"
                        }
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Color={color} Thickness={2}>
                            <uigradient Color={textBorderGradient} Rotation={90} />
                        </uistroke>
                    </textlabel>
                </frame>
                <frame AnchorPoint={new Vector2(1, 0.5)} BackgroundTransparency={1} Size={new UDim2(0.3, 0, 0.8, -10)}>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        Padding={new UDim(0, 0)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Bottom}
                    />
                    <textlabel
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        Position={new UDim2(0.5, 0, 0.25, 0)}
                        Size={new UDim2(1, 0, 0.15, 0)}
                        Text={`Created ${os.date("%x", empireInfo.created)}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        TextWrapped={true}
                    >
                        <uistroke Color={color} Thickness={2}>
                            <uigradient Color={textBorderGradient} Rotation={90} />
                        </uistroke>
                    </textlabel>
                    <textlabel
                        Active={true}
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        Position={new UDim2(0.5, 0, 0.25, 0)}
                        Size={new UDim2(1, 0, 0.15, 0)}
                        Text={`Played for ${convertToHHMMSS(empireInfo.playtime)}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        TextWrapped={true}
                    >
                        <uistroke Color={color} Thickness={2}>
                            <uigradient Color={textBorderGradient} Rotation={90} />
                        </uistroke>
                    </textlabel>
                </frame>
            </frame>
            <textlabel
                Active={true}
                AnchorPoint={new Vector2(0.5, 1)}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 0.95, 0)}
                Size={new UDim2(1, 0, 0.01, 15)}
                Text={empireId}
                TextColor3={Color3.fromRGB(156, 156, 156)}
                TextScaled={true}
                TextSize={14}
                TextTransparency={0.9}
                TextWrapped={true}
            />
        </BaseMenuOption>
    );
}

/**
 * Empires window component for empire selection and creation
 */
export default function EmpiresWindow({ exitStart, onClose }: { exitStart: () => void; onClose: () => void }) {
    const labelRef = useRef<TextLabel>();
    const availableEmpires = useProperty(Packets.availableEmpires);
    const [isCreatingEmpire, setIsCreatingEmpire] = useState(false);

    const handleCreateEmpire = useCallback(() => {
        if (isCreatingEmpire) return;

        setIsCreatingEmpire(true);
        const success = Packets.createNewEmpire.toServer();
        if (success) {
            playSound("MenuClick.mp3");
        } else {
            playSound("Error.mp3");
            showErrorToast("Failed to create a new empire.");
        }

        // Reset state after delay
        task.delay(3, () => setIsCreatingEmpire(false));
    }, [isCreatingEmpire]);

    return (
        <frame BackgroundTransparency={1} Position={new UDim2(0, 0, 0, 0)} Size={new UDim2(1, 0, 1, 0)}>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                VerticalFlex={Enum.UIFlexAlignment.Fill}
            />

            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.05, 0)}>
                <uiflexitem FlexMode={Enum.UIFlexMode.Shrink} />
            </frame>

            <MenuOption
                label="Back"
                gradientColors={[Color3.fromRGB(255, 224, 84), Color3.fromRGB(171, 105, 5)]}
                onClick={() => {
                    playSound("EmphasisMenuSelect.mp3", undefined, (sound) => (sound.Volume = 0.4));
                    onClose();
                }}
                height={50}
                animationDelay={0}
                fast={true}
            />

            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0.05, 0)} />

            {/* Create New Empire Option */}
            <MenuOption
                label={isCreatingEmpire ? "Creating empire..." : "New Empire"}
                gradientColors={[Color3.fromRGB(255, 158, 250), Color3.fromRGB(235, 48, 209)]}
                onClick={() => {
                    playSound("EmphasisMenuSelect.mp3", undefined, (sound) => (sound.Volume = 0.4));
                    handleCreateEmpire();
                }}
                height={70}
                animationDelay={0}
                fast={true}
            />

            {/* Empire Options Scrolling Frame */}
            <scrollingframe
                Active={true}
                BackgroundColor3={Color3.fromRGB(15, 15, 25)}
                BackgroundTransparency={1}
                BorderSizePixel={0}
                Size={new UDim2(1, 0, 0.65, 0)}
                ScrollBarThickness={6}
                ScrollBarImageColor3={Color3.fromRGB(85, 170, 255)}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
            >
                <uilistlayout HorizontalAlignment={Enum.HorizontalAlignment.Left} SortOrder={Enum.SortOrder.Name} />

                {/* Empire Options */}
                {(() => {
                    const empireElements = new Array<JSX.Element>();
                    for (const [empireId, empireInfo] of availableEmpires) {
                        empireElements.push(
                            <EmpireOption key={empireId} empireId={empireId} empireInfo={empireInfo} />,
                        );
                    }
                    return empireElements;
                })()}
            </scrollingframe>

            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 0)}>
                <uiflexitem FlexMode={Enum.UIFlexMode.Fill} />
            </frame>

            {/* Public Empire Window */}
            <BaseMenuOption
                gradientColors={[Color3.fromRGB(84, 255, 159), Color3.fromRGB(5, 171, 105)]}
                onClick={() => {
                    playSound("EmphasisMenuSelect.mp3", undefined, (sound) => (sound.Volume = 0.4));
                    exitStart();
                }}
                size={new UDim2(0.1, 400, 0, 60)}
                fast={true}
            >
                {/* Label */}
                <textlabel
                    ref={labelRef}
                    Active={true}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Position={new UDim2(0.05, 0, 0, 5)}
                    Size={new UDim2(0, 0, 0.7, -10)}
                    Text={"Join Public Empire"}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={60}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    ZIndex={2}
                >
                    <uistroke Thickness={3} />
                </textlabel>
                <textlabel
                    Active={true}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Position={new UDim2(0.05, 0, 0.7, -10)}
                    Size={new UDim2(0, 0, 0.3, 0)}
                    Text={"Your data will not be saved with this option!"}
                    TextColor3={Color3.fromRGB(196, 196, 196)}
                    TextScaled={true}
                    TextSize={60}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uistroke Thickness={2} />
                </textlabel>
            </BaseMenuOption>
        </frame>
    );
}
