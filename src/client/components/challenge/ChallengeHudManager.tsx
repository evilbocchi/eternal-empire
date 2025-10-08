/**
 * @fileoverview ChallengeHudManager handles just the HUD display for current challenges.
 * This is separate from ChallengeManager to allow different positioning and lifecycle.
 */

import React, { Fragment } from "@rbxts/react";
import ChallengeHudDisplay from "client/components/challenge/ChallengeHudDisplay";
import useProperty from "client/hooks/useProperty";
import Packets from "shared/Packets";
/**
 * ChallengeHudManager component that manages just the HUD display for challenges
 */
export default function ChallengeHudManager() {
    const challengeInfos = useProperty(Packets.challenges);
    const [currentChallenge, setCurrentChallenge] = React.useState<ChallengeInfo | undefined>(undefined);

    // Listen for current challenge updates
    React.useEffect(() => {
        const connection = Packets.currentChallenge.observe((key) => {
            if (key === "") {
                setCurrentChallenge(undefined);
                return;
            }
            const challengeInfo = challengeInfos.get(key);

            setCurrentChallenge(challengeInfo);
        });

        return () => {
            connection.disconnect();
        };
    }, []);

    if (!currentChallenge) {
        return <Fragment />;
    }

    return (
        <ChallengeHudDisplay
            challengeName={currentChallenge.name}
            challengeDescription={currentChallenge.description}
            challengeColors={{
                primary: Color3.fromRGB(currentChallenge.r1, currentChallenge.g1, currentChallenge.b1),
                secondary: Color3.fromRGB(currentChallenge.r2, currentChallenge.g2, currentChallenge.b2),
            }}
        />
    );
}
