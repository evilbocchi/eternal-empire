import { FuzzySearch } from "@rbxts/fuzzy-search";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { Environment } from "@rbxts/ui-labs";
import { LOCAL_PLAYER } from "shared/constants";
import { RobotoMono, RobotoSlab, RobotoSlabMedium } from "shared/asset/GameFonts";
import Command from "shared/commands/Command";
import Packets from "shared/Packets";

interface CommandSuggestion {
    command: Command;
    score: number;
}

/**
 * Command interface for simulation stories to run commands when chat isn't available in Studio
 */
export default function SimulationCommandInterface() {
    const [isVisible, setIsVisible] = useState(false);
    const [inputText, setInputText] = useState("");
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);
    const inputRef = useRef<TextBox>();
    const frameRef = useRef<Frame>();

    // Get all available commands - memoize to avoid recalculation
    const availableCommands = useMemo(() => Command.listAllCommands(), []);

    // Memoize the handle execute command function to avoid recreating it
    const handleExecuteCommand = useCallback(() => {
        if (inputText === "" || inputText.gsub("%s", "")[0] === "") return;

        const commandText = inputText.gsub("^%s*(.-)%s*$", "%1")[0]; // Trim whitespace

        // Normalize command text - add slash if missing
        const normalizedCommand = commandText.sub(1, 1) === "/" ? commandText : "/" + commandText;

        // Add to history
        setCommandHistory((prev) => {
            const newHistory = [...prev];
            if (newHistory[newHistory.size() - 1] !== normalizedCommand) {
                newHistory.push(normalizedCommand);
                // Keep only last 50 commands
                if (newHistory.size() > 50) {
                    newHistory.shift();
                }
            }
            return newHistory;
        });

        // Parse command - use normalized command (with slash)
        const parts = normalizedCommand.sub(2).split(" "); // Remove '/' and split
        const commandId = parts[0];
        const args = new Array<string>();
        for (let i = 1; i < parts.size(); i++) {
            args.push(parts[i]);
        }

        // Find command
        let targetCommand: Command | undefined;
        for (const [, command] of availableCommands) {
            if (command.id === commandId || command.aliases.includes(commandId)) {
                targetCommand = command;
                break;
            }
        }

        if (!targetCommand) {
            print(`Command '${commandId}' not found`);
            return;
        }

        // Execute command
        try {
            print(`Executing: ${normalizedCommand}`);
            targetCommand.execute(LOCAL_PLAYER, ...args);
        } catch (error) {
            print(`Command execution failed: ${error}`);
        }

        // Clear input and hide interface
        setInputText("");
        setHistoryIndex(-1);
        setSuggestions([]);
        setSelectedSuggestion(0);
        setIsVisible(false);
    }, [inputText, availableCommands]);

    // Separate function for autocompletion
    const handleAutocomplete = useCallback(() => {
        if (suggestions.size() > 0 && selectedSuggestion >= 0) {
            const selectedCmd = suggestions[selectedSuggestion];
            if (selectedCmd) {
                setInputText("/" + selectedCmd.command.id + " ");
                setSuggestions([]);
                setSelectedSuggestion(0);
            }
        }
    }, [suggestions, selectedSuggestion]);

    // Memoize terms and command mapping to avoid recalculating on every keystroke
    const commandTerms = useMemo(() => {
        const terms = new Array<string>();
        const commandPerTerm = new Map<string, Command>();

        for (const [, command] of availableCommands) {
            terms.push(command.id);
            commandPerTerm.set(command.id, command);
            for (const alias of command.aliases) {
                terms.push(alias);
                commandPerTerm.set(alias, command);
            }
        }

        return { terms, commandPerTerm };
    }, [availableCommands]);

    // Handle keyboard shortcuts - separated into its own effect for better performance
    useEffect(() => {
        const connection = Environment.UserInput.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;
            // Check for Shift+I shortcut to run /iset all 20
            if (input.KeyCode === Enum.KeyCode.I) {
                if (
                    Environment.UserInput.IsKeyDown(Enum.KeyCode.LeftShift) ||
                    Environment.UserInput.IsKeyDown(Enum.KeyCode.RightShift)
                ) {
                    // Execute /iset all 20 command directly
                    const commandId = "iset";
                    const args = ["all", "20"];

                    // Find command
                    let targetCommand: Command | undefined;
                    for (const [, command] of availableCommands) {
                        if (command.id === commandId || command.aliases.includes(commandId)) {
                            targetCommand = command;
                            break;
                        }
                    }

                    if (targetCommand) {
                        try {
                            print("Executing: /iset all 20 (Shift+I shortcut)");
                            targetCommand.execute(LOCAL_PLAYER, ...args);
                        } catch (error) {
                            print(`Command execution failed: ${error}`);
                        }
                    } else {
                        print("Command 'iset' not found");
                    }
                    return;
                }
            }

            // Toggle with F12 or backtick key
            if (input.KeyCode === Enum.KeyCode.F12 || input.KeyCode === Enum.KeyCode.Backquote) {
                setIsVisible((prev) => {
                    const newVisible = !prev;
                    if (newVisible) {
                        task.spawn(() => {
                            task.wait(0.1); // Small delay to ensure render
                            if (inputRef.current) {
                                inputRef.current.CaptureFocus();
                            }
                        });
                    }
                    return newVisible;
                });
                return;
            }

            // Handle input when visible
            if (isVisible) {
                if (input.KeyCode === Enum.KeyCode.Escape) {
                    setIsVisible(false);
                } else if (
                    input.KeyCode === Enum.KeyCode.Return ||
                    input.KeyCode === Enum.KeyCode.KeypadEnter ||
                    input.KeyCode === Enum.KeyCode.L
                ) {
                    handleExecuteCommand();
                } else if (input.KeyCode === Enum.KeyCode.Up) {
                    if (suggestions.size() > 0) {
                        setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : suggestions.size() - 1));
                    } else if (commandHistory.size() > 0 && historyIndex < commandHistory.size() - 1) {
                        const newIndex = historyIndex + 1;
                        setHistoryIndex(newIndex);
                        setInputText(commandHistory[commandHistory.size() - 1 - newIndex]);
                    }
                } else if (input.KeyCode === Enum.KeyCode.Down) {
                    if (suggestions.size() > 0) {
                        setSelectedSuggestion((prev) => (prev < suggestions.size() - 1 ? prev + 1 : 0));
                    } else if (historyIndex > 0) {
                        const newIndex = historyIndex - 1;
                        setHistoryIndex(newIndex);
                        setInputText(commandHistory[commandHistory.size() - 1 - newIndex]);
                    } else if (historyIndex === 0) {
                        setHistoryIndex(-1);
                        setInputText("");
                    }
                } else if (input.KeyCode === Enum.KeyCode.Tab) {
                    handleAutocomplete();
                }
            }
        });

        return () => connection.Disconnect();
    }, [
        isVisible,
        historyIndex,
        suggestions,
        selectedSuggestion,
        commandHistory,
        handleExecuteCommand,
        handleAutocomplete,
    ]);

    // Update suggestions based on input text - debounced for better performance
    useEffect(() => {
        if (inputText === "") {
            setSuggestions([]);
            setSelectedSuggestion(0);
            return;
        }

        // Remove leading slash if present for search, but keep original for display
        const withoutSlash = inputText.sub(1, 1) === "/" ? inputText.sub(2) : inputText;
        if (withoutSlash === "") {
            setSuggestions([]);
            setSelectedSuggestion(0);
            return;
        }

        // Extract only the first word (command name) for searching, ignoring arguments
        const parts = withoutSlash.split(" ");
        const searchText = parts[0] || "";
        if (searchText === "") {
            setSuggestions([]);
            setSelectedSuggestion(0);
            return;
        }

        // Use timeout for debouncing to avoid lag on rapid typing
        const timeoutId = task.delay(0.1, () => {
            const fuzzyResults = FuzzySearch.Sorting.FuzzyScore(commandTerms.terms, searchText);
            const newSuggestions = new Array<CommandSuggestion>();
            const addedCommands = new Set<string>(); // Track added commands to avoid duplicates

            for (const [score, term] of fuzzyResults) {
                if (score <= 0 || newSuggestions.size() >= 5) continue;

                const command = commandTerms.commandPerTerm.get(term);
                if (command && !addedCommands.has(command.id)) {
                    addedCommands.add(command.id);
                    newSuggestions.push({ command, score });
                }
            }

            setSuggestions(newSuggestions);
            setSelectedSuggestion(0);
        });

        return () => {
            task.cancel(timeoutId);
        };
    }, [inputText, commandTerms]);

    if (!isVisible) {
        return (
            <textlabel
                BackgroundTransparency={0.5}
                BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={0}
                FontFace={RobotoSlabMedium}
                Position={new UDim2(0, 10, 1, -60)}
                Size={new UDim2(0, 300, 0, 20)}
                Text="Press F12 or ` for commands | Shift+I: /iset all 20"
                TextColor3={Color3.fromRGB(200, 200, 200)}
                TextScaled={true}
                TextSize={12}
                ZIndex={1000}
            >
                <uicorner CornerRadius={new UDim(0, 4)} />
            </textlabel>
        );
    }

    return (
        <Fragment>
            {/* Background overlay */}
            <frame
                BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                BackgroundTransparency={0.5}
                BorderSizePixel={0}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={999}
            />

            {/* Main command interface */}
            <frame
                ref={frameRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0, 600, 0, 400)}
                ZIndex={1000}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />
                <uistroke Color={Color3.fromRGB(100, 100, 100)} Thickness={2} />

                {/* Header */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabMedium}
                    Position={new UDim2(0, 0, 0, 10)}
                    Size={new UDim2(1, 0, 0, 30)}
                    Text="Simulation Command Interface"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={18}
                >
                    <uitextsizeconstraint MaxTextSize={18} />
                </textlabel>

                {/* Input field */}
                <frame
                    BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                    BorderSizePixel={0}
                    Position={new UDim2(0, 20, 0, 50)}
                    Size={new UDim2(1, -40, 0, 40)}
                >
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <uistroke Color={Color3.fromRGB(120, 120, 120)} Thickness={1} />

                    <textbox
                        ref={inputRef}
                        BackgroundTransparency={1}
                        ClearTextOnFocus={false}
                        FontFace={RobotoMono}
                        PlaceholderText="Type a command (e.g., help or /help)..."
                        PlaceholderColor3={Color3.fromRGB(150, 150, 150)}
                        Position={new UDim2(0, 15, 0, 0)}
                        Size={new UDim2(1, -100, 1, 0)}
                        Text={inputText}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={16}
                        TextXAlignment={Enum.TextXAlignment.Left}
                        Change={{
                            Text: (textBox) => {
                                setInputText(textBox.Text);
                                setHistoryIndex(-1);
                            },
                        }}
                        Event={{
                            FocusLost: (_textBox, enterPressed) => {
                                if (enterPressed) {
                                    handleExecuteCommand();
                                }
                            },
                        }}
                    >
                        <uitextsizeconstraint MaxTextSize={16} />
                    </textbox>

                    {/* Execute Button */}
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(80, 160, 80)}
                        BorderSizePixel={0}
                        FontFace={RobotoSlabMedium}
                        Position={new UDim2(1, -80, 0, 5)}
                        Size={new UDim2(0, 70, 0, 30)}
                        Text="Execute"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        Event={{
                            Activated: handleExecuteCommand,
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 4)} />
                        <uitextsizeconstraint MaxTextSize={14} />
                    </textbutton>
                </frame>

                {/* Suggestions */}
                {suggestions.size() > 0 && (
                    <scrollingframe
                        AutomaticCanvasSize={Enum.AutomaticSize.Y}
                        BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                        BorderSizePixel={0}
                        CanvasSize={new UDim2(0, 0, 0, 0)}
                        Position={new UDim2(0, 20, 0, 100)}
                        ScrollBarThickness={4}
                        Size={new UDim2(1, -40, 0, 250)}
                    >
                        <uicorner CornerRadius={new UDim(0, 6)} />
                        <uilistlayout Padding={new UDim(0, 2)} SortOrder={Enum.SortOrder.LayoutOrder} />
                        <uipadding
                            PaddingBottom={new UDim(0, 5)}
                            PaddingLeft={new UDim(0, 10)}
                            PaddingRight={new UDim(0, 10)}
                            PaddingTop={new UDim(0, 5)}
                        />

                        {suggestions.map((suggestion, index) => (
                            <frame
                                key={suggestion.command.id}
                                BackgroundColor3={
                                    index === selectedSuggestion
                                        ? Color3.fromRGB(80, 80, 80)
                                        : Color3.fromRGB(45, 45, 45)
                                }
                                BorderSizePixel={0}
                                LayoutOrder={index}
                                Size={new UDim2(1, -10, 0, 60)}
                            >
                                <uicorner CornerRadius={new UDim(0, 4)} />

                                <textlabel
                                    BackgroundTransparency={1}
                                    FontFace={RobotoSlabMedium}
                                    Position={new UDim2(0, 10, 0, 5)}
                                    Size={new UDim2(1, -20, 0, 20)}
                                    Text={`/${suggestion.command.id}`}
                                    TextColor3={Color3.fromRGB(100, 255, 100)}
                                    TextScaled={true}
                                    TextSize={14}
                                    TextXAlignment={Enum.TextXAlignment.Left}
                                >
                                    <uitextsizeconstraint MaxTextSize={14} />
                                </textlabel>

                                <textlabel
                                    BackgroundTransparency={1}
                                    FontFace={RobotoSlab}
                                    Position={new UDim2(0, 10, 0, 25)}
                                    Size={new UDim2(1, -20, 0, 30)}
                                    Text={suggestion.command.description}
                                    TextColor3={Color3.fromRGB(200, 200, 200)}
                                    TextScaled={true}
                                    TextSize={12}
                                    TextWrapped={true}
                                    TextXAlignment={Enum.TextXAlignment.Left}
                                    TextYAlignment={Enum.TextYAlignment.Top}
                                >
                                    <uitextsizeconstraint MaxTextSize={12} />
                                </textlabel>
                            </frame>
                        ))}
                    </scrollingframe>
                )}

                {/* Help text */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Position={new UDim2(0, 20, 1, -40)}
                    Size={new UDim2(1, -40, 0, 30)}
                    Text="Enter/L/Execute: Run | Tab: Autocomplete | ↑↓: Navigate | Esc: Close | F12/`: Toggle | Shift+I: /iset all 20 | / optional"
                    TextColor3={Color3.fromRGB(150, 150, 150)}
                    TextScaled={true}
                    TextSize={10}
                    TextWrapped={true}
                >
                    <uitextsizeconstraint MaxTextSize={10} />
                </textlabel>
            </frame>
        </Fragment>
    );
}
