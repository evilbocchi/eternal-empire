import React, { Fragment, useEffect, useRef } from "@rbxts/react";
import { observeCharacter } from "shared/constants";
import { showToast } from "client/components/toast/ToastService";
import Sandbox from "shared/Sandbox";

const OBSTACLE_ZONE_NAME = "ObbyZone";
const DEFAULT_OBBY_WALK_SPEED = 16;
const DEBOUNCE_DURATION = 0.1;

export default function WalkspeedManager() {
    const lastCustomWalkspeed = useRef(DEFAULT_OBBY_WALK_SPEED);
    const isDebounced = useRef(false);

    useEffect(() => {
        if (Sandbox.getEnabled()) {
            return;
        }

        let cleanupCharacterConnections: (() => void) | undefined;

        const releaseDebounce = () => {
            task.delay(DEBOUNCE_DURATION, () => {
                isDebounced.current = false;
            });
        };

        const disconnectCharacterObserver = observeCharacter((character) => {
            cleanupCharacterConnections?.();

            const humanoid = character.FindFirstChildOfClass("Humanoid");
            const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;

            if (!humanoid || !rootPart) {
                return;
            }

            lastCustomWalkspeed.current = humanoid.WalkSpeed;

            const handleZoneEntered = (part: BasePart) => {
                if (part.Name !== OBSTACLE_ZONE_NAME || isDebounced.current) {
                    return;
                }

                isDebounced.current = true;
                lastCustomWalkspeed.current = humanoid.WalkSpeed;
                const newWalkspeed = DEFAULT_OBBY_WALK_SPEED;
                humanoid.WalkSpeed = newWalkspeed;
                showToast({
                    message: `You have entered an Obby. (Walkspeed = ${newWalkspeed})`,
                    variant: "info",
                });
                releaseDebounce();
            };

            const handleZoneExited = (part: BasePart) => {
                if (part.Name !== OBSTACLE_ZONE_NAME || isDebounced.current) {
                    return;
                }

                isDebounced.current = true;
                const restoredWalkspeed = lastCustomWalkspeed.current;
                humanoid.WalkSpeed = restoredWalkspeed;
                showToast({
                    message: `You have left the Obby. (Walkspeed = ${restoredWalkspeed})`,
                    variant: "info",
                });
                releaseDebounce();
            };

            const touchedConnection = rootPart.Touched.Connect(handleZoneEntered);
            const touchEndedConnection = rootPart.TouchEnded.Connect(handleZoneExited);

            cleanupCharacterConnections = () => {
                touchedConnection.Disconnect();
                touchEndedConnection.Disconnect();
            };
        });

        return () => {
            cleanupCharacterConnections?.();
            disconnectCharacterObserver();
        };
    }, []);

    return <Fragment />;
}
