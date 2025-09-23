import { PropertyPacket } from "@rbxts/fletchette";
import { useEffect, useState } from "@rbxts/react";
import { IS_CI } from "shared/Context";

/**
 * A custom hook for observing a property packet and getting its current value.
 *
 * @param propertyPacket The property packet to observe.
 * @returns The current value of the property.
 */
function useProperty<T>(propertyPacket: PropertyPacket<T>) {
    // Allow property to be T | undefined for correct typing
    const [property, setProperty] = useState<T | undefined>(propertyPacket.get());

    useEffect(() => {
        // Set the state every time the server sends a property update
        const connection = propertyPacket.observe((newProperty) => {
            if (IS_CI && typeIs(newProperty, "table")) {
                newProperty = table.clone(newProperty);
            }
            setProperty(newProperty);
        });
        return () => connection.disconnect();
    }, [propertyPacket]);

    return property!;
}

export = useProperty;
