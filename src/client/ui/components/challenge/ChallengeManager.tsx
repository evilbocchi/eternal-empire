/**
 * @fileoverview ChallengeManager handles challenge state and integration with the packets system.
 * Manages the current challenge, available challenges, and user interactions.
 */

import React, { Fragment } from "@rbxts/react";
import ChallengeGui, { Challenge, CurrentChallengeInfo } from "./ChallengeGui";
import Packets from "shared/Packets";
import { playSound } from "shared/asset/GameAssets";

// Sample challenge data - this would typically come from your game data
const sampleChallenges: Challenge[] = [
    {
        id: "melting-economy-1",
        name: "Melting Economy I",
        description: "Funds gain is heavily nerfed by ^0.95.",
        notice: "A Skillification will be simulated. Your progress is not lost.",
        requirement: "Requirement: Purchase Admiration or Codependence",
        reward: "Boost: x$1 > x$2",
        colors: {
            primary: Color3.fromRGB(170, 255, 151),
            secondary: Color3.fromRGB(0, 170, 255),
        },
        isUnlocked: false,
    },
    // Add more challenges as needed
];

/**
 * ChallengeManager component that manages challenge state and UI
 */
export default function ChallengeManager() {
    const [challenges, setChallenges] = React.useState<Challenge[]>(sampleChallenges);
    const [currentChallenge, setCurrentChallenge] = React.useState<CurrentChallengeInfo | undefined>(undefined);

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

    // Listen for challenge completion events
    React.useEffect(() => {
        const connection = Packets.challengeCompleted.fromServer((challenge, rewardLabel) => {
            // Play completion sound
            playSound("MagicCast.mp3");

            // Could show a completion notification here
            print(`Challenge completed: ${challenge} - Rewards: ${rewardLabel}`);
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

    const handleStartChallenge = (challengeId: string) => {
        // Play confirmation sound
        playSound("MagicCast.mp3");

        // Send challenge start packet to server
        Packets.startChallenge.toServer(challengeId);
    };

    const handleQuitChallenge = () => {
        // Play quit sound
        playSound("MagicCast.mp3");

        // Send quit packet to server
        Packets.quitChallenge.toServer();
    };

    // Don't render if no challenges and not in a challenge
    if (challenges.size() === 0 && !currentChallenge) {
        return <Fragment />;
    }

    return (
        <ChallengeGui
            challenges={challenges}
            currentChallenge={currentChallenge}
            onStartChallenge={handleStartChallenge}
            onQuitChallenge={handleQuitChallenge}
        />
    );
}
