import { FuzzySearch } from "@rbxts/fuzzy-search";
import React, { useEffect, useState } from "@rbxts/react";
import { LOCAL_PLAYER } from "client/constants";
import CommandOption from "client/ui/components/commands/CommandOption";
import useSingleDocumentWindow from "client/ui/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/ui/components/window/TechWindow";
import { RobotoSlab, RobotoSlabMedium } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import Command from "shared/commands/Command";

interface CommandsWindowProps {
    defaultPermissionLevel?: number;
}

interface CommandInfo extends Command {
    layoutOrder?: number;
}

const COMMAND_PER_ID = Command.listAllCommands();

export default function CommandsWindow({ defaultPermissionLevel }: CommandsWindowProps) {
    const [userPermissionLevel, setUserPermissionLevel] = useState(defaultPermissionLevel ?? 0);
    const { visible, closeWindow } = useSingleDocumentWindow("Commands");
    const [filteredCommands, setFilteredCommands] = useState<Set<CommandInfo>>(new Set());
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        LOCAL_PLAYER.GetAttributeChangedSignal("PermissionLevel").Connect(() => {
            setUserPermissionLevel((LOCAL_PLAYER.GetAttribute("PermissionLevel") as number) ?? defaultPermissionLevel);
        });
        setUserPermissionLevel((LOCAL_PLAYER.GetAttribute("PermissionLevel") as number) ?? defaultPermissionLevel);
    }, []);

    // Extract command information from TextChatService
    useEffect(() => {
        const extractedCommands = new Set<Command>();
        const terms = new Array<string>();
        const commandPerTerm = new Map<string, Command>();

        for (const [, command] of COMMAND_PER_ID) {
            // Skip commands without descriptions
            if (command.description === undefined) {
                continue;
            }

            // Hide level 4+ commands for non-level 4 users
            if (command.permissionLevel > 3 && userPermissionLevel < 4) {
                continue;
            }
            (command as CommandInfo).layoutOrder = command.permissionLevel;
            extractedCommands.add(command);
            terms.push(command.id);
            commandPerTerm.set(command.id, command);
        }
        if (searchText === "") {
            setFilteredCommands(extractedCommands);
            return;
        }

        const sorted = FuzzySearch.Sorting.FuzzyScore(terms, searchText);
        const filtered = new Set<Command>();
        for (const [index, term] of sorted) {
            if (index <= 0) continue; // Skip non-matches
            const command = commandPerTerm.get(term);
            if (command) {
                (command as CommandInfo).layoutOrder = index; // Use fuzzy score as layout order
                filtered.add(command as CommandInfo);
            }
        }
        setFilteredCommands(filtered);
    }, [userPermissionLevel, searchText]);

    const commandOptions = new Array<JSX.Element>();
    for (const command of filteredCommands) {
        commandOptions.push(
            <CommandOption
                key={command.id}
                alias={command.id}
                description={command.description}
                permissionLevel={command.permissionLevel}
                userPermissionLevel={userPermissionLevel}
                layoutOrder={command.layoutOrder ?? command.permissionLevel}
            />,
        );
    }

    return (
        <TechWindow
            visible={visible}
            icon={getAsset("assets/Settings.png")}
            title="Commands"
            onClose={closeWindow}
            priority={9}
        >
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)}>
                {/* Search Bar */}
                <frame
                    key="SearchContainer"
                    BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                    BackgroundTransparency={0.2}
                    BorderSizePixel={0}
                    Position={new UDim2(0, 10, 0, 10)}
                    Size={new UDim2(1, -20, 0, 40)}
                >
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <uistroke Color={Color3.fromRGB(100, 100, 100)} Thickness={1} />

                    <textbox
                        key="SearchBox"
                        BackgroundTransparency={1}
                        FontFace={RobotoSlab}
                        PlaceholderText="Search commands..."
                        PlaceholderColor3={Color3.fromRGB(150, 150, 150)}
                        Position={new UDim2(0, 15, 0, 0)}
                        Size={new UDim2(1, -30, 1, 0)}
                        Text={searchText}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={16}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        Change={{
                            Text: (textBox) => {
                                setSearchText(textBox.Text);
                            },
                        }}
                    >
                        <uitextsizeconstraint MaxTextSize={16} />
                    </textbox>
                </frame>

                {/* Commands Count */}
                <textlabel
                    key="CommandsCount"
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabMedium}
                    Position={new UDim2(0, 15, 0, 50)}
                    Size={new UDim2(1, 0, 0, 20)}
                    Text={`${filteredCommands.size()} command${filteredCommands.size() === 1 ? "" : "s"} available`}
                    TextColor3={Color3.fromRGB(200, 200, 200)}
                    TextScaled={true}
                    TextSize={12}
                    TextXAlignment={Enum.TextXAlignment.Left}
                >
                    <uitextsizeconstraint MaxTextSize={12} />
                </textlabel>

                {/* Commands List */}
                <scrollingframe
                    key="CommandsList"
                    AnchorPoint={new Vector2(0.5, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    Position={new UDim2(0.5, 0, 0, 70)}
                    ScrollBarThickness={6}
                    Selectable={false}
                    Size={new UDim2(1, 0, 1, -100)}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        Padding={new UDim(0, 15)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />
                    <uipadding
                        PaddingBottom={new UDim(0, 10)}
                        PaddingLeft={new UDim(0, 10)}
                        PaddingRight={new UDim(0, 10)}
                        PaddingTop={new UDim(0, 10)}
                    />

                    {commandOptions}

                    {filteredCommands.size() === 0 && searchText !== "" && (
                        <textlabel
                            key="NoResults"
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabMedium}
                            Size={new UDim2(1, 0, 0, 50)}
                            Text={`No commands found for "${searchText}"`}
                            TextColor3={Color3.fromRGB(150, 150, 150)}
                            TextScaled={true}
                            TextSize={14}
                        >
                            <uitextsizeconstraint MaxTextSize={14} />
                        </textlabel>
                    )}
                </scrollingframe>
            </frame>
        </TechWindow>
    );
}
