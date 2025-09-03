import React, { useEffect, useState } from "@rbxts/react";
import { RunService, Workspace } from "@rbxts/services";

/**
 * Hook that tracks the player's character position in real-time.
 *
 * @param character The player's character model to track
 * @returns The current position as Vector3, or undefined if no character/position available
 */
export function usePlayerPosition(character?: Model): Vector3 | undefined {
    const [position, setPosition] = useState<Vector3 | undefined>(undefined);

    useEffect(() => {
        const rootPart = (character?.FindFirstChild("Humanoid") as Humanoid | undefined)?.RootPart;

        // Set up real-time position updates
        const connection = RunService.Heartbeat.Connect(() => {
            setPosition(rootPart?.Position ?? Workspace.CurrentCamera?.CFrame.Position);
        });

        // Clean up connection when character dies or component unmounts
        const deathConnection = rootPart?.Destroying.Connect(() => {
            connection.Disconnect();
            setPosition(undefined);
        });

        // Cleanup function
        return () => {
            connection.Disconnect();
            deathConnection?.Disconnect();
            setPosition(undefined);
        };
    }, [character]);

    return position;
}

/**
 * Hook that provides the current player's character and position.
 *
 * @param player The player to track (defaults to LocalPlayer)
 * @returns Object containing character and current position
 */
export function useCharacterPosition(player?: Player): { character?: Model; position?: Vector3 } {
    const [character, setCharacter] = useState<Model | undefined>();

    // Get position using the character
    const position = usePlayerPosition(character);

    useEffect(() => {
        if (!player) {
            setCharacter(undefined);
            return;
        }

        // Set initial character if it exists
        if (player.Character) {
            setCharacter(player.Character);
        }

        // Listen for character spawns
        const characterAddedConnection = player.CharacterAdded.Connect((newCharacter) => {
            setCharacter(newCharacter);
        });

        // Listen for character removal
        const characterRemovingConnection = player.CharacterRemoving.Connect(() => {
            setCharacter(undefined);
        });

        // Cleanup
        return () => {
            characterAddedConnection.Disconnect();
            characterRemovingConnection.Disconnect();
        };
    }, [player]);

    return { character, position };
}
