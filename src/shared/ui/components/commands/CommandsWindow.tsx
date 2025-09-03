import React, { useEffect, useMemo, useState } from "@rbxts/react";
import { TextChatService } from "@rbxts/services";
import CommandOption from "shared/ui/components/commands/CommandOption";

export interface CommandInfo {
    alias: string;
    description: string;
    permissionLevel: number;
}

interface CommandsWindowProps {
    visible: boolean;
    userPermissionLevel: number;
}

export default function CommandsWindow({ visible, userPermissionLevel }: CommandsWindowProps) {
    const [commands, setCommands] = useState<CommandInfo[]>([]);

    // Extract command information from TextChatService
    useEffect(() => {
        const extractedCommands: CommandInfo[] = [];
        const textChatCommands = TextChatService.GetDescendants();

        for (const command of textChatCommands) {
            if (!command.IsA("TextChatCommand")) {
                continue;
            }

            const permissionLevel = (command.GetAttribute("PermissionLevel") as number) ?? 0;
            const description = command.GetAttribute("Description") as string;

            // Skip commands without descriptions
            if (description === undefined) {
                continue;
            }

            // Hide level 4+ commands for non-level 4 users
            if (permissionLevel > 3 && userPermissionLevel < 4) {
                continue;
            }

            extractedCommands.push({
                alias: command.PrimaryAlias,
                description: description,
                permissionLevel: permissionLevel,
            });
        }

        setCommands(extractedCommands);
    }, [userPermissionLevel]);

    // Sort commands by permission level for display
    const sortedCommands = useMemo(() => {
        return [...commands].sort((a, b) => a.permissionLevel < b.permissionLevel);
    }, [commands]);

    if (!visible) {
        return undefined;
    }

    return (
        <frame key="Commands" BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={visible}>
            <scrollingframe
                key="CommandsList"
                AnchorPoint={new Vector2(0.5, 0)}
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                Position={new UDim2(0.5, 0, 0, 0)}
                ScrollBarThickness={6}
                Selectable={false}
                Size={new UDim2(1, 0, 1, 0)}
            >
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 10)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
                <uipadding
                    PaddingBottom={new UDim(0, 5)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 5)}
                />

                {sortedCommands.map((command, index) => (
                    <CommandOption
                        key={command.alias}
                        alias={command.alias}
                        description={command.description}
                        permissionLevel={command.permissionLevel}
                        userPermissionLevel={userPermissionLevel}
                        layoutOrder={command.permissionLevel}
                    />
                ))}
            </scrollingframe>
        </frame>
    );
}
