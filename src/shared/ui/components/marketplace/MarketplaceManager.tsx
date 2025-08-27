import React, { useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import Packets from "shared/Packets";
import MarketplaceWindow from "shared/ui/components/marketplace/MarketplaceWindow";

interface MarketplaceManagerProps {
    // Optional props for customization
}

/**
 * High-level marketplace manager component that handles UI state and hotkeys.
 * This component should be integrated into your main UI controller.
 */
export default function MarketplaceManager(props: MarketplaceManagerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isMarketplaceEnabled, setIsMarketplaceEnabled] = useState(true);

    // Set up keyboard hotkey (M key to toggle marketplace)
    React.useEffect(() => {
        const connection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;

            if (input.KeyCode === Enum.KeyCode.M) {
                if (isMarketplaceEnabled) {
                    setIsVisible(!isVisible);
                }
            }
        });

        return () => connection.Disconnect();
    }, [isVisible, isMarketplaceEnabled]);

    // Listen for marketplace enabled state changes
    React.useEffect(() => {
        const connection = Packets.marketplaceEnabled.observe((enabled) => {
            setIsMarketplaceEnabled(enabled);
            if (!enabled) {
                setIsVisible(false); // Close marketplace if disabled
            }
        });

        return () => connection.Disconnect();
    }, []);

    // Listen for terminal signals
    React.useEffect(() => {
        const openConnection = Packets.openMarketplaceTerminal.fromServer(() => {
            if (isMarketplaceEnabled) {
                setIsVisible(true);
            }
        });

        const closeConnection = Packets.closeMarketplaceTerminal.fromServer(() => {
            setIsVisible(false);
        });

        return () => {
            openConnection.Disconnect();
            closeConnection.Disconnect();
        };
    }, [isMarketplaceEnabled]);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isMarketplaceEnabled) {
        return <></>;
    }

    return (
        <MarketplaceWindow
            visible={isVisible}
            onClose={handleClose}
        />
    );
}