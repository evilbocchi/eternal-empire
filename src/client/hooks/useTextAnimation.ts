/**
 * @fileoverview React hook for handling text animation in dialogue windows.
 *
 * Provides typing effect with character-by-character reveal, sound playback,
 * and timing variations for punctuation marks. Based on the original DialogueController logic.
 */

import { RefObject, useEffect, useState } from "@rbxts/react";
import { Debris, ReplicatedStorage, RunService } from "@rbxts/services";
import { getSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        NPCTextSounds: Folder;
    }

    interface UseTextAnimationProps {
        /** The full text to animate */
        text: string;
        /** Reference to the text label that displays the animated text */
        textLabelRef: RefObject<TextLabel>;
        /** Reference to the hint label that shows when animation is complete */
        hintLabelRef: RefObject<TextLabel>;
        /** Whether the dialogue window is visible */
        visible: boolean;
        /** Sound to play for text typing (optional) */
        textSound?: Sound;
    }
}

/**
 * Hook that provides text typing animation for dialogue windows
 *
 * @param props Configuration object for text animation
 * @returns Object containing current display text and completion status
 */
export function useTextAnimation({ text, textLabelRef, hintLabelRef, visible, textSound }: UseTextAnimationProps) {
    const [displayText, setDisplayText] = useState("");
    const [charIndex, setCharIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const defaultTextSound = (function () {
        const defaultText = getSound("DefaultText.mp3").Clone();
        defaultText.Volume = 0.25;
        return defaultText;
    })();

    useEffect(() => {
        if (!visible || !text) {
            setDisplayText("");
            setCharIndex(0);
            setIsComplete(false);
            return;
        }

        // Reset animation when text changes
        setDisplayText("");
        setCharIndex(0);
        setIsComplete(false);
    }, [text, visible]);

    useEffect(() => {
        if (!visible) return;

        let connection: RBXScriptConnection | undefined;
        let time = 0;
        let minDeltaTime = 0.03;

        const updateAnimation = (deltaTime: number) => {
            time += deltaTime;
            if (time < minDeltaTime) return;
            time = 0;

            if (charIndex < text.size()) {
                const newIndex = charIndex + 1;
                const newDisplayText = text.sub(1, newIndex);
                const currentChar = text.sub(newIndex, newIndex);
                const isSpace = currentChar === " ";

                setDisplayText(newDisplayText);
                setCharIndex(newIndex);

                // Update hint label visibility
                if (hintLabelRef.current) {
                    hintLabelRef.current.Visible = false;
                }

                // Play sound for non-space characters
                if (!isSpace) {
                    const sound = (textSound ?? defaultTextSound).Clone();
                    sound.Parent = ReplicatedStorage;
                    if (Packets.settings.get()?.SoundEffects) {
                        sound.Play();
                    }
                    Debris.AddItem(sound);
                }

                // Adjust timing based on character type
                const lastChar = text.sub(newIndex - 1, newIndex - 1);
                const isPunctuation = lastChar === "." || lastChar === "?" || lastChar === "!";
                minDeltaTime = isSpace ? (isPunctuation ? 0.3 : lastChar === "," ? 0.15 : 0.03) : 0.03;
            } else {
                // Animation complete
                setIsComplete(true);
                if (hintLabelRef.current) {
                    hintLabelRef.current.Visible = true;
                }
            }
        };

        connection = RunService.Heartbeat.Connect(updateAnimation);

        return () => {
            if (connection) {
                connection.Disconnect();
            }
        };
    }, [charIndex, text, visible, textSound, hintLabelRef]);

    return {
        displayText,
        isComplete,
        skipToEnd: () => {
            if (charIndex < text.size()) {
                setDisplayText(text);
                setCharIndex(text.size());
                setIsComplete(true);
                if (hintLabelRef.current) {
                    hintLabelRef.current.Visible = true;
                }
            }
        },
    };
}
