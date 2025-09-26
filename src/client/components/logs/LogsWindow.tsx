import React, { useCallback, useEffect, useState } from "@rbxts/react";
import LogEntry from "client/components/logs/LogEntry";
import PaginationControls from "client/components/logs/PaginationControls";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/components/window/TechWindow";
import { RobotoMonoBold } from "client/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import Packets from "shared/Packets";

const LOGS_PER_PAGE = 20;

/**
 * Main logs window component displaying game logs with pagination
 * Features enhanced visual design with modern styling and smooth interactions
 */
export default function LogsWindow() {
    const { id, visible } = useSingleDocument({ id: "Logs" });

    // State for logs and pagination
    const [logs, setLogs] = useState<Log[]>([]);
    const [pendingLogs, setPendingLogs] = useState<Log[]>([]); // Logs received while window is closed
    const [currentPage, setCurrentPage] = useState(1);

    // Load initial logs and listen for new ones
    useEffect(() => {
        // Load initial logs
        const initialLogs = Packets.getLogs.toServer();
        setLogs([...initialLogs]);

        // Listen for new logs
        const connection = Packets.logsAdded.fromServer((newLogs) => {
            if (visible) {
                setLogs((prevLogs) => [...prevLogs, ...newLogs]);
            } else {
                setPendingLogs((prevPending) => [...prevPending, ...newLogs]);
            }
        });

        return () => connection.Disconnect();
    }, []);

    // When window becomes visible, add any pending logs
    useEffect(() => {
        if (visible && pendingLogs.size() > 0) {
            setLogs((prevLogs) => [...prevLogs, ...pendingLogs]);
            setPendingLogs([]);
        }
    }, [visible, pendingLogs]);

    // Calculate pagination
    const totalPages = math.ceil(logs.size() / LOGS_PER_PAGE);
    const startIndex = logs.size() - currentPage * LOGS_PER_PAGE;
    const endIndex = startIndex + LOGS_PER_PAGE;

    // Get current page logs (roblox-ts doesn't have array.slice, so we use a for loop)
    const currentLogs: Log[] = [];
    const actualStartIndex = math.max(0, startIndex);
    for (let i = actualStartIndex; i < math.min(endIndex, logs.size()); i++) {
        currentLogs.unshift(logs[i]); // unshift to reverse the order
    }

    // Pagination handlers
    const handlePreviousPage = useCallback(() => {
        setCurrentPage((prev) => math.max(1, prev - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage((prev) => math.min(totalPages, prev + 1));
    }, [totalPages]);

    return (
        <TechWindow visible={visible} icon={getAsset("assets/Settings.png")} id={id}>
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                {/* Header with info text */}
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0, 5)}
                    Size={new UDim2(0.8, 0, 0, 16)}
                    Text="Logs clear after 7 days"
                    TextColor3={Color3.fromRGB(129, 129, 129)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Color={Color3.fromRGB(0, 0, 0)} Thickness={2} />
                </textlabel>

                {/* Scrollable log list */}
                <scrollingframe
                    AnchorPoint={new Vector2(0.5, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    Position={new UDim2(0.5, 0, 0, 30)}
                    ScrollBarThickness={6}
                    Selectable={false}
                    Size={new UDim2(1, -20, 1, -75)}
                    ScrollBarImageColor3={Color3.fromRGB(255, 255, 255)}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        Padding={new UDim(0, 8)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />
                    <uipadding
                        PaddingBottom={new UDim(0, 10)}
                        PaddingLeft={new UDim(0, 15)}
                        PaddingRight={new UDim(0, 15)}
                        PaddingTop={new UDim(0, 10)}
                    />

                    {/* Render log entries */}
                    {currentLogs.map((log: Log, index: number) => (
                        <LogEntry key={actualStartIndex + index} log={log} layoutOrder={index} />
                    ))}
                </scrollingframe>

                {/* Pagination controls */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPreviousPage={handlePreviousPage}
                    onNextPage={handleNextPage}
                />
            </frame>
        </TechWindow>
    );
}
