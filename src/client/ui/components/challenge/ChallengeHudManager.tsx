/**
 * @fileoverview ChallengeHudManager handles just the HUD display for current challenges.
 * This is separate from ChallengeManager to allow different positioning and lifecycle.
 */

import React, { Fragment } from "@rbxts/react";
import ChallengeHudDisplay from "./ChallengeHudDisplay";
import Packets from "shared/Packets";

interface CurrentChallengeHudInfo {
    name: string;
    description: string;
    colors: {
        primary: Color3;
        secondary: Color3;
    };
}

/**
 * ChallengeHudManager component that manages just the HUD display for challenges
 */
export default function ChallengeHudManager() {
    const [currentChallenge, setCurrentChallenge] = React.useState<CurrentChallengeHudInfo | undefined>(undefined);

    // Listen for current challenge updates
    React.useEffect(() => {
        const connection = Packets.currentChallenge.observe((challengeInfo) => {
            if (challengeInfo.name === "") {
                setCurrentChallenge(undefined);
                return;
            }

            setCurrentChallenge({
                name: challengeInfo.name,
                description: challengeInfo.description,
                colors: {
                    primary: new Color3(challengeInfo.r1, challengeInfo.g1, challengeInfo.b1),
                    secondary: new Color3(challengeInfo.r2, challengeInfo.g2, challengeInfo.b2),
                },
            });
        });

        return () => {
            connection.disconnect();
        };
    }, []);

    return (
        <ChallengeHudDisplay
            challengeName={currentChallenge?.name || ""}
            challengeDescription={currentChallenge?.description || ""}
            challengeColors={
                currentChallenge?.colors || {
                    primary: Color3.fromRGB(255, 255, 255),
                    secondary: Color3.fromRGB(255, 255, 255),
                }
            }
            visible={currentChallenge !== undefined}
        />
    );
}
