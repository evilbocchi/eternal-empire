import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { RobotoSlabBold } from "shared/asset/GameFonts";
import Packets from "shared/Packets";

const COLORS = [
    Color3.fromRGB(239, 68, 68), // Red
    Color3.fromRGB(59, 130, 246), // Blue
    Color3.fromRGB(34, 197, 94), // Green
    Color3.fromRGB(250, 204, 21), // Yellow
];

export default function PillarPuzzle() {
    const [visible, setVisible] = useState(false);
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [showingSequence, setShowingSequence] = useState(false);
    const [message, setMessage] = useState("Watch the sequence!");

    useEffect(() => {
        const visibleConnection = Packets.pillarPuzzleVisible.observe((value) => {
            setVisible(value);
            if (value) {
                setPlayerSequence([]);
                setShowingSequence(false);
                setMessage("Watch the sequence!");
            }
        });

        const sequenceConnection = Packets.pillarPuzzleSequence.observe((seq) => {
            setSequence(seq);
            if (seq.size() > 0) {
                setShowingSequence(true);
                setMessage("Watch the sequence!");
            }
        });

        return () => {
            visibleConnection.disconnect();
            sequenceConnection.disconnect();
        };
    }, []);

    const handleButtonClick = useCallback(
        (index: number) => {
            if (showingSequence) return;

            const newSequence = [...playerSequence, index];
            setPlayerSequence(newSequence);

            // Check if the player's sequence matches so far
            if (sequence[newSequence.size() - 1] !== index) {
                setMessage("Wrong! Try again.");
                task.delay(1, () => {
                    setPlayerSequence([]);
                    setMessage("Watch the sequence again!");
                    setShowingSequence(true);
                });
            } else if (newSequence.size() === sequence.size()) {
                setMessage("Correct! Submitting...");
                Packets.submitPuzzleAnswer.toServer(newSequence);
                task.delay(1, () => {
                    setVisible(false);
                });
            } else {
                setMessage(`Keep going! (${newSequence.size()}/${sequence.size()})`);
            }
        },
        [showingSequence, playerSequence, sequence],
    );

    useEffect(() => {
        if (showingSequence && sequence.size() > 0) {
            let index = 0;
            const showNext = () => {
                if (index < sequence.size()) {
                    const buttonIndex = sequence[index];
                    // Flash the button (visual feedback would be nice but keeping it simple)
                    index++;
                    task.delay(0.6, showNext);
                } else {
                    setShowingSequence(false);
                    setMessage("Now repeat the sequence!");
                }
            };
            task.delay(0.5, showNext);
        }
    }, [showingSequence, sequence]);

    if (!visible) {
        return <></>;
    }

    return (
        <frame
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(25, 27, 31)}
            BorderSizePixel={0}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Size={new UDim2(0, 400, 0, 450)}
            ZIndex={100}
        >
            <uicorner CornerRadius={new UDim(0, 12)} />
            <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={3} Transparency={0.5} />

            {/* Title */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0, 0, 0, 20)}
                Size={new UDim2(1, 0, 0, 40)}
                Text="Pillar Memory Puzzle"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextWrapped={true}
                ZIndex={101}
            >
                <uipadding PaddingLeft={new UDim(0, 20)} PaddingRight={new UDim(0, 20)} />
            </textlabel>

            {/* Message */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0, 0, 0, 70)}
                Size={new UDim2(1, 0, 0, 30)}
                Text={message}
                TextColor3={Color3.fromRGB(200, 200, 200)}
                TextScaled={true}
                TextWrapped={true}
                ZIndex={101}
            >
                <uipadding PaddingLeft={new UDim(0, 20)} PaddingRight={new UDim(0, 20)} />
            </textlabel>

            {/* Buttons */}
            <frame
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.55, 0)}
                Size={new UDim2(0, 300, 0, 300)}
                ZIndex={101}
            >
                <uigridlayout
                    CellPadding={new UDim2(0, 10, 0, 10)}
                    CellSize={new UDim2(0, 140, 0, 140)}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                {COLORS.map((color, index) => (
                    <textbutton
                        key={index}
                        BackgroundColor3={color}
                        BorderSizePixel={0}
                        Text=""
                        ZIndex={102}
                        Event={{
                            Activated: () => handleButtonClick(index),
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uistroke Color={Color3.fromRGB(255, 255, 255)} Thickness={2} Transparency={0.3} />
                    </textbutton>
                ))}
            </frame>
        </frame>
    );
}
