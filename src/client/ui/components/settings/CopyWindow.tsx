import React, { useEffect, useState } from "@rbxts/react";
import useSingleDocument from "client/ui/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/ui/components/window/TechWindow";
import { RobotoMono } from "client/ui/GameFonts";
import Packets from "shared/Packets";

export default function CopyWindow() {
    const { id, visible, openDocument } = useSingleDocument({ id: "Copy", priority: 10 });
    const [text, setText] = useState("Copy this text");

    useEffect(() => {
        const connection = Packets.codeReceived.fromServer((code: string) => {
            setText(code);
            openDocument();
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

    return (
        <TechWindow icon="" id={id} title="Text Content" visible={visible} size={new UDim2(0.5, 0, 0.5, -50)}>
            <textbox
                BackgroundColor3={Color3.fromRGB(20, 20, 20)}
                BackgroundTransparency={0.3}
                ClearTextOnFocus={false}
                FontFace={RobotoMono}
                Size={new UDim2(1, 0, 1, 0)}
                Text={text}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={16}
                TextWrapped={true}
            >
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(54, 54, 54)}
                    Thickness={1}
                />
            </textbox>
        </TechWindow>
    );
}
