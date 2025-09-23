import React from "@rbxts/react";
import useProperty from "client/ui/hooks/useProperty";
import Packets from "shared/Packets";
import { playSound } from "shared/asset/GameAssets";
import ChallengeGui, { CurrentChallengeInfo } from "./ChallengeGui";

/**
 * ChallengeManager component that manages challenge state and UI
 */
export default function ChallengeManager() {
    const challengeInfos = useProperty(Packets.challenges);
    const [currentChallenge, setCurrentChallenge] = React.useState<CurrentChallengeInfo | undefined>(undefined);

    // Listen for current challenge updates
    React.useEffect(() => {
        const connection = Packets.currentChallenge.observe((key) => {
            const challengeInfo = challengeInfos.get(key);
            if (!challengeInfo || key === "") {
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

    return (
        <ChallengeGui
            challenges={challengeInfos}
            currentChallenge={currentChallenge}
            onStartChallenge={handleStartChallenge}
            onQuitChallenge={handleQuitChallenge}
        />
    );
}
