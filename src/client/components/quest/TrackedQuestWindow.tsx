import React, { useEffect, useRef, useState } from "@rbxts/react";
import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { useDocument } from "client/components/window/DocumentManager";
import { observeCharacter } from "client/constants";
import { RobotoSlabBold } from "client/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { IS_EDIT } from "shared/Context";
import { useQuestData } from "./useQuestData";

/**
 * Returns the description and position details for the current quest stage.
 * @param id The quest ID.
 * @param quest The quest info.
 * @param stageNum The stage number.
 */
export function getPositionDetails(id?: string, quest?: QuestInfo, stageNum = 0) {
    if (stageNum < 0) {
        return { description: "Quest complete." };
    }
    let description = quest?.stages[stageNum]?.description;
    if (description === undefined || id === undefined) {
        return { description: "" };
    }

    const key = id + stageNum;
    const position = ReplicatedStorage.GetAttribute(key) as Vector3 | undefined;
    if (position !== undefined) {
        description = description.gsub(
            "%%coords%%",
            `(${math.round(position.X)}, ${math.round(position.Y)}, ${math.round(position.Z)})`,
        )[0];
    }
    return { description, position, key };
}

export default function TrackedQuestWindow() {
    const ref = useRef<Frame>();
    const [trackerBeam, setTrackerBeam] = useState<Beam>();
    const [trackerPart, setTrackerPart] = useState<Part>();
    const { questInfo, stagePerQuest, trackedQuest } = useQuestData();
    const currentQuest = trackedQuest ? questInfo.get(trackedQuest) : undefined;
    const currentStage = trackedQuest ? (stagePerQuest.get(trackedQuest) ?? 0) : 0;
    const { description, key } = getPositionDetails(trackedQuest, currentQuest, currentStage);

    const openPosition = new UDim2(1, -5, 0, 30);
    const closedPosition = openPosition.add(new UDim2(0, 0, 0, -100));
    const { visible, setVisible } = useDocument({ id: "TrackedQuest", priority: -1 });

    useEffect(() => {
        if (visible) {
            ref.current?.TweenPosition(openPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 1, true);
        } else {
            ref.current?.TweenPosition(closedPosition, Enum.EasingDirection.In, Enum.EasingStyle.Quad, 1, true);
        }
    }, [visible]);

    useEffect(() => {
        if (currentQuest && trackedQuest && currentStage >= 0) {
            playSound("QuestNextStage.mp3");
            setVisible(true);
        } else {
            setVisible(false);
        }

        const onPositionUpdated = (newPosition: Vector3 | undefined) => {
            if (trackerPart === undefined || trackerBeam === undefined) return;
            if (newPosition) {
                trackerPart.Position = newPosition ?? new Vector3(0, -500, 0);
                trackerBeam.Enabled = true;
            } else {
                trackerBeam.Enabled = false;
            }
        };
        onPositionUpdated(key ? (ReplicatedStorage.GetAttribute(key) as Vector3 | undefined) : undefined);
        const connection = key
            ? ReplicatedStorage.GetAttributeChangedSignal(key).Connect(() => {
                  onPositionUpdated(ReplicatedStorage.GetAttribute(key) as Vector3 | undefined);
              })
            : undefined;

        return () => {
            connection?.Disconnect();
        };
    }, [key, currentStage]);

    useEffect(() => {
        if (trackerBeam === undefined || currentQuest === undefined) return;
        const color = Color3.fromRGB(currentQuest.colorR, currentQuest.colorG, currentQuest.colorB);
        trackerBeam.Color = new ColorSequence(color);
    }, [currentQuest, trackerBeam]);

    useEffect(() => {
        const beam = new Instance("Beam");
        beam.Brightness = 1;
        beam.LightEmission = 0.25;
        beam.LightInfluence = 0;
        beam.Texture = getAsset("assets/ArrowBeam.png");
        beam.TextureLength = 2;
        beam.TextureMode = Enum.TextureMode.Static;
        beam.TextureSpeed = -4;
        beam.Transparency = new NumberSequence([
            new NumberSequenceKeypoint(0, 1),
            new NumberSequenceKeypoint(0.1, 0.5),
            new NumberSequenceKeypoint(0.9, 0.5),
            new NumberSequenceKeypoint(1, 1),
        ]);
        beam.CurveSize0 = 0;
        beam.CurveSize1 = 0;
        beam.Width0 = 2;
        beam.Width1 = 2;
        beam.FaceCamera = true;
        beam.Enabled = false;

        const beamContainer = new Instance("Part");
        beamContainer.Transparency = 1;
        beamContainer.CanCollide = false;
        beamContainer.CanTouch = false;
        beamContainer.CanQuery = false;
        beamContainer.Anchored = true;

        beam.Attachment0 = new Instance("Attachment", beamContainer);

        let dummyCharacter: Part | undefined;
        let cleanup: () => void;
        if (IS_EDIT) {
            dummyCharacter = new Instance("Part");
            dummyCharacter.Anchored = true;
            dummyCharacter.CanCollide = false;
            dummyCharacter.CanTouch = false;
            dummyCharacter.CanQuery = false;
            dummyCharacter.Locked = true;
            dummyCharacter.Transparency = 1;
            beam.Attachment1 = new Instance("Attachment", dummyCharacter);
            dummyCharacter.Parent = beamContainer;
            const connection = RunService.Heartbeat.Connect(() => {
                if (!dummyCharacter) {
                    connection.Disconnect();
                    return;
                }
                const cframe = Workspace.CurrentCamera?.CFrame ?? new CFrame();
                dummyCharacter.CFrame = cframe.add(cframe.LookVector.mul(20));
            });
            cleanup = () => {
                connection.Disconnect();
            };
        } else {
            cleanup = observeCharacter((char: Model) => {
                beam.Attachment1 = new Instance("Attachment", char.WaitForChild("HumanoidRootPart", 10));
            });
        }

        beam.Parent = beamContainer;
        beamContainer.Parent = Workspace;

        setTrackerBeam(beam);
        setTrackerPart(beamContainer);

        return () => {
            beam.Destroy();
            beamContainer.Destroy();
            dummyCharacter?.Destroy();
            cleanup();
        };
    }, []);

    const questColor = currentQuest
        ? Color3.fromRGB(currentQuest.colorR, currentQuest.colorG, currentQuest.colorB)
        : Color3.fromRGB(255, 255, 255);

    return (
        <frame
            ref={ref}
            key="TrackedQuestWindow"
            AnchorPoint={new Vector2(1, 0)}
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            Position={closedPosition}
            Size={new UDim2(0.2, 200, 0, 0)}
            ZIndex={-1}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            {/* Quest Title */}
            <textlabel
                key="TitleLabel"
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(1, 0, 0, 0)}
                Text={currentQuest?.name ?? ""}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={30}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uigradient
                    Color={new ColorSequence(questColor.Lerp(new Color3(1, 1, 1), 0.5), questColor)}
                    Rotation={50}
                />
                <uistroke Thickness={2} />
            </textlabel>

            {/* Quest Description */}
            <textlabel
                key="DescriptionLabel"
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={1}
                Size={new UDim2(1, 0, 0, 0)}
                Text={description}
                TextColor3={Color3.fromRGB(182, 182, 182)}
                TextSize={20}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={1.5} />
            </textlabel>
            <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
        </frame>
    );
}
